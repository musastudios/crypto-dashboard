# Supabase Setup Scripts for NextAuth.js

These scripts help set up the required database tables for NextAuth.js to work with Supabase.

## The Issue

Supabase only allows access to the `public` and `graphql_public` schemas through its REST API. The standard NextAuth.js Supabase adapter tries to use a `next_auth` schema, which causes errors when trying to authenticate.

## Our Solution

We've created:

1. A custom Supabase adapter that works with tables in the `public` schema
2. SQL scripts to create the necessary tables in the `public` schema
3. A setup script to help automate the table creation

## Files

- `create-exec-sql-function.sql`: SQL script that creates a function to execute SQL via the Supabase REST API
- `create-public-auth-tables.sql`: SQL script that creates the NextAuth.js tables in the `public` schema
- `setup-supabase.js`: Node.js script that executes the SQL scripts against your Supabase database
- `setup-supabase.sh`: Shell script to run the setup-supabase.js script

## Setup Instructions

You have two options to set up your Supabase database:

### Option 1: Using the Script (Easiest)

1. Make sure you have Node.js installed
2. Run the setup script:
   ```
   ./scripts/setup-supabase.sh
   ```

If you encounter an error about the `exec_sql` function not existing, follow the instructions shown in the terminal to create it first.

### Option 2: Using the Supabase Dashboard

1. Log in to the [Supabase Dashboard](https://app.supabase.com/)
2. Go to your project and click on the SQL Editor
3. Create a new query and paste the contents of `create-public-auth-tables.sql`
4. Run the query

## Troubleshooting

- If you still encounter authentication issues after setup, try restarting your Next.js server.
- Make sure your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correctly set in your `.env.local` file.
- Check your Google OAuth configuration in the Google Cloud Console to ensure that the callback URL is correct.

## Using the Custom Adapter

We've created a custom Supabase adapter that works with the `public` schema. It's automatically used in the auth configuration. 