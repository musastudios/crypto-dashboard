const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

async function executeSqlWithSupabase(sqlContent) {
  try {
    // Create a Supabase client
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Execute SQL directly using Supabase's rpc function
    const { data, error } = await supabase.rpc('exec_sql', { query: sqlContent });
    
    if (error) {
      // If exec_sql function doesn't exist, suggest creating it
      if (error.message.includes('does not exist')) {
        console.error('The "exec_sql" function doesn\'t exist. You need to create it first.');
        console.error('Please run this SQL in the Supabase SQL Editor:');
        
        const createFnSql = fs.readFileSync(path.join(__dirname, 'create-exec-sql-function.sql'), 'utf8');
        console.error(createFnSql);
        
        console.error('\nThen run this script again.');
        return false;
      }
      
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { success: false, error };
  }
}

async function setupPublicSchema() {
  console.log('Setting up auth tables in the public schema...');
  
  try {
    // Read SQL from file
    const sqlFilePath = path.join(__dirname, 'create-public-auth-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const result = await executeSqlWithSupabase(sqlContent);
    
    if (!result.success) {
      console.error('Error setting up auth tables');
      return false;
    }
    
    console.log('Successfully set up auth tables in public schema');
    
    // Now let's run the column fix SQL
    console.log('Fixing column naming issues...');
    const fixColumnsSqlPath = path.join(__dirname, 'fix-email-verified-column.sql');
    const fixColumnsSql = fs.readFileSync(fixColumnsSqlPath, 'utf8');
    
    const fixResult = await executeSqlWithSupabase(fixColumnsSql);
    
    if (!fixResult.success) {
      console.error('Error fixing column names');
      return false;
    }
    
    console.log('Successfully fixed column naming issues');
    return true;
  } catch (error) {
    console.error('Error setting up public schema:', error);
    
    // Fallback to web-based approach
    console.log('\nFALLBACK: Please set up the tables manually through the Supabase dashboard:');
    console.log('1. Log in to https://app.supabase.com/');
    console.log('2. Navigate to your project\'s SQL Editor');
    console.log('3. Create a new query and paste the following SQL:');
    
    const sqlFilePath = path.join(__dirname, 'create-public-auth-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('\n' + sqlContent);
    
    // Also show the fix columns SQL
    console.log('\nThen run this SQL to fix column naming:');
    const fixColumnsSqlPath = path.join(__dirname, 'fix-email-verified-column.sql');
    const fixColumnsSql = fs.readFileSync(fixColumnsSqlPath, 'utf8');
    console.log('\n' + fixColumnsSql);
    
    return false;
  }
}

async function main() {
  try {
    const isSetupSuccessful = await setupPublicSchema();
    
    if (isSetupSuccessful) {
      console.log('\nSetup completed successfully!');
      console.log('You can now restart your Next.js server and Google SSO should work.');
    } else {
      console.log('\nSetup could not be completed automatically.');
      console.log('Please follow the manual instructions above to set up your Supabase database.');
    }
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main(); 