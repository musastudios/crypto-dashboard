#!/bin/bash

# Set colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}Error: .env.local file not found.${NC}"
  exit 1
fi

# Source environment variables
source <(grep -v '^#' .env.local | sed -E 's/(.*)=(.*)/export \1="\2"/')

echo -e "${BLUE}=== Resetting OAuth Authentication Data ===${NC}"

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env.local${NC}"
  exit 1
fi

echo -e "${YELLOW}Warning: This will delete existing authentication data.${NC}"
echo -e "Press ENTER to continue or CTRL+C to cancel..."
read

# Run the SQL query
echo -e "${BLUE}Setting up database schema...${NC}"
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$(cat fix-supabase-auth.sql)\"}" \
  -s > /dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Database schema reset successfully!${NC}"
else
  echo -e "${RED}Failed to reset database schema.${NC}"
  exit 1
fi

# Kill any running Next.js servers
echo -e "${BLUE}Stopping any running Next.js servers...${NC}"
pkill -f "next dev" || echo "No Next.js servers found running"

# Clear cookies
echo -e "${YELLOW}Important: Please clear your browser cookies for localhost:3001${NC}"
echo -e "${YELLOW}In Chrome: chrome://settings/siteData and search for 'localhost'${NC}"
echo -e "${YELLOW}In Firefox: about:preferences#privacy and click 'Clear Data'${NC}"
echo -e "${YELLOW}In Safari: Preferences > Privacy > Manage Website Data and search for 'localhost'${NC}"

# Start the server
echo -e "${BLUE}Starting Next.js server...${NC}"
./start-dev.sh &

echo -e "${GREEN}Reset complete! Try signing in with Google again.${NC}" 