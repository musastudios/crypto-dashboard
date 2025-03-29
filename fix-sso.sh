#!/bin/bash

# Show welcome message
echo "==== Google SSO Setup Helper ===="
echo "This script will help fix Google SSO with Supabase"
echo ""

# Step 1: Check required dependencies
echo "Checking dependencies..."
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required but not installed. Please install Node.js and try again."
  exit 1
fi

# Step 2: Set up Supabase for NextAuth.js
echo "Step 1: Setting up Supabase database tables..."
chmod +x ./scripts/setup-supabase.sh
./scripts/setup-supabase.sh

# Check if the setup was successful
if [ $? -ne 0 ]; then
  echo "⚠️  Automated setup failed. Would you like to try the manual setup? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "Manual setup instructions:"
    echo "1. Go to your Supabase dashboard: https://app.supabase.com/"
    echo "2. Open the SQL Editor"
    echo "3. Run the following SQL commands:"
    echo ""
    cat scripts/create-public-auth-tables.sql
    echo ""
    cat scripts/fix-email-verified-column.sql
    echo ""
    echo "4. After running these commands, press any key to continue or Ctrl+C to exit"
    read -n 1 -s
  else
    echo "Exiting without completing setup."
    exit 1
  fi
fi

# Step 3: Kill any existing Next.js processes
echo ""
echo "Step 2: Stopping any running Next.js servers..."
pkill -f "next dev" || echo "No Next.js servers found running."

# Step 4: Clear browser sessions (optional but helpful)
echo ""
echo "Step 3: Please clear your browser cookies and session data for localhost:3000 before continuing."
echo "This will ensure a clean authentication experience."
echo "Press any key when ready to continue..."
read -n 1 -s

# Step 5: Restart the server
echo ""
echo "Step 4: Starting the server on port 3000..."
./start-dev.sh

echo ""
echo "Server is now running. You should be able to use Google SSO."
echo "If you still encounter issues, please check:"
echo "1. Your Google OAuth credentials in Google Cloud Console"
echo "2. The callback URL is set to http://localhost:3000/api/auth/callback/google"
echo "3. Your Supabase tables have been set up correctly" 