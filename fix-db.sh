#!/bin/bash

# Color coding for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==== Supabase Database Fix for NextAuth.js ====${NC}"
echo "This script will directly fix the database schema issues"
echo ""

# Load variables from .env.local
if [ -f .env.local ]; then
  echo "Loading environment variables..."
  export $(grep -v '^#' .env.local | xargs)
else
  echo -e "${RED}Error: .env.local file not found${NC}"
  exit 1
fi

# Check if required variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Error: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY not found in .env.local${NC}"
  exit 1
fi

echo "Using Supabase URL: $SUPABASE_URL"

# Read the SQL file content and properly escape it for JSON
SQL_CONTENT=$(cat fix-db.sql | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr -d '\n')

echo -e "${YELLOW}Applying database fixes directly...${NC}"

# Create a temporary JSON file
TMP_JSON=$(mktemp)
echo "{\"query\": \"$SQL_CONTENT\"}" > "$TMP_JSON"

# Make the API call to execute the SQL
curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d @"$TMP_JSON"

# Clean up temp file
rm "$TMP_JSON"

echo -e "\n\n${GREEN}Database fix applied!${NC}"

# Alternative: Use the SQL Editor
echo -e "${YELLOW}If you encounter issues, use the SQL editor in Supabase:${NC}"
echo "1. Log into https://app.supabase.com"
echo "2. Go to your project's SQL Editor"
echo "3. Copy and paste this SQL and run it:"
echo "----------------------------------------"
cat fix-db.sql
echo "----------------------------------------"

echo ""
echo "Next steps:"
echo "1. Restart your Next.js server: ./start-dev.sh"
echo "2. Clear your browser cookies for localhost:3000"
echo "3. Try logging in again with Google SSO" 