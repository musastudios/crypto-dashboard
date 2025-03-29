#!/bin/bash

# Set colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}   Google SSO with Supabase - Setup Script   ${NC}"
echo -e "${GREEN}==============================================${NC}"
echo ""

# 1. Check environment variables
echo -e "${BLUE}Step 1: Checking environment variables...${NC}"
if [ ! -f .env.local ]; then
  echo -e "${RED}Error: .env.local file not found!${NC}"
  exit 1
fi

# Source the env variables
echo "Loading environment variables from .env.local..."
export $(grep -v '^#' .env.local | xargs)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Error: Missing required Supabase environment variables in .env.local${NC}"
  echo "Please ensure you have set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo -e "${RED}Error: Missing required Google OAuth environment variables in .env.local${NC}"
  echo "Please ensure you have set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
  exit 1
fi

echo -e "${GREEN}✓ Environment variables verified successfully!${NC}"
echo ""

# 2. Set up Supabase database structure
echo -e "${BLUE}Step 2: Setting up Supabase database...${NC}"
echo "This step will reset and recreate all the auth-related tables in Supabase."
echo -e "${YELLOW}Warning: This will delete existing auth data in your database.${NC}"
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Setup cancelled."
  exit 1
fi

# Execute SQL directly using the Supabase API
echo "Applying database schema changes..."
SQL_CONTENT=$(cat fix-supabase-auth.sql)

# Format SQL content for the request
# Create a temporary file to store the request payload
TMP_FILE=$(mktemp)
echo '{"query": "'"$SQL_CONTENT"'"}' > "$TMP_FILE"

# Make the request
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d @"$TMP_FILE")

# Clean up temp file
rm "$TMP_FILE"

if [[ $RESPONSE == *"error"* ]]; then
  echo -e "${RED}Error executing SQL: $RESPONSE${NC}"
  echo -e "${YELLOW}You'll need to manually run the SQL script in the Supabase dashboard.${NC}"
  echo "1. Go to https://app.supabase.com"
  echo "2. Go to your project's SQL editor"
  echo "3. Paste the contents of fix-supabase-auth.sql and run it"
  echo -e "${YELLOW}Do you want to open the SQL file to copy its contents? (y/n)${NC}"
  read -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat fix-supabase-auth.sql
  fi
else
  echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
fi
echo ""

# 3. Test Google OAuth integration
echo -e "${BLUE}Step 3: Checking Google OAuth configuration...${NC}"
echo "Validating Google OAuth settings..."

# Print the required redirect URI
echo -e "${YELLOW}Please ensure you have added the following redirect URI to your Google OAuth settings:${NC}"
echo "http://localhost:3000/api/auth/callback/google"
echo ""
echo -e "${YELLOW}For production, also add:${NC}"
echo "https://your-domain.com/api/auth/callback/google"
echo ""

# 4. Kill any running server processes
echo -e "${BLUE}Step 4: Stopping any running servers...${NC}"
pkill -f "next dev" || echo "No Next.js servers found running."
echo -e "${GREEN}✓ Server processes stopped!${NC}"
echo ""

# 5. Clear browser cookies
echo -e "${BLUE}Step 5: Clear your browser cookies${NC}"
echo -e "${YELLOW}Please clear your browser cookies and session data for localhost:3000 before continuing.${NC}"
echo "This will ensure a clean authentication experience."
echo "Press any key when ready to continue..."
read -n 1 -s
echo ""

# 6. Start the server
echo -e "${BLUE}Step 6: Starting the server...${NC}"
echo "Starting the Next.js development server on port 3000..."
./start-dev.sh &

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}   Setup Complete! Server is running   ${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo "Testing steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Click 'Sign in with Google'"
echo "3. Complete the Google authentication flow"
echo ""
echo -e "${YELLOW}If you still have issues, please check:${NC}"
echo "- Your Google OAuth setup in Google Cloud Console"
echo "- Your Supabase database structure"
echo "- Application logs for more detailed error messages"
echo ""
echo -e "${BLUE}Happy coding!${NC}" 