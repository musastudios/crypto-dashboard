#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed. Please install Node.js to continue."
  exit 1
fi

# Check if required packages are installed
echo "Checking required packages..."
MISSING_PACKAGES=()

if ! node -e "require('dotenv')" &> /dev/null; then
  MISSING_PACKAGES+=("dotenv")
fi

if ! node -e "require('@supabase/supabase-js')" &> /dev/null; then
  MISSING_PACKAGES+=("@supabase/supabase-js")
fi

# Install missing packages if any
if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
  echo "Installing missing packages: ${MISSING_PACKAGES[*]}"
  npm install ${MISSING_PACKAGES[*]} --no-save
fi

# Run the setup script
echo "Setting up Supabase database for NextAuth.js..."
node "$(dirname "$0")/setup-supabase.js"

# Suggest restarting the server
echo ""
echo "If the setup was successful, restart your Next.js server using:"
echo "./start-dev.sh" 