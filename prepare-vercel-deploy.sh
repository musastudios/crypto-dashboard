#!/bin/bash

# Set colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Preparing for Vercel Deployment ===${NC}"

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo -e "${RED}Error: .env.production file not found.${NC}"
  echo -e "Creating .env.production file..."
  cat > .env.production << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://gygqqsteltvimulggcvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Z3Fxc3RlbHR2aW11bGdnY3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDU0NjcsImV4cCI6MjA1ODc4MTQ2N30.JwuISrkKT0B_CRljnX_kdGWMygyw1sl6M3aXkzz4CvM
SUPABASE_URL=https://gygqqsteltvimulggcvs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Z3Fxc3RlbHR2aW11bGdnY3ZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzIwNTQ2NywiZXhwIjoyMDU4NzgxNDY3fQ.qA8m51v0BR1xnJaBo-DCz0X7TQIgeVjg6zlP4icMNiE

# NextAuth.js Configuration
NEXTAUTH_URL=https://crypto-dashboard-olive.vercel.app
NEXTAUTH_SECRET=s9a9bHYnjpV34EmRgPXYMFvM+Vfdw3KfOQJsOgux/Ew=

# Google OAuth
GOOGLE_CLIENT_ID=1023044498320-iqvlovlp7i52hohhtk60p9p278fomoci.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Twitter OAuth
TWITTER_CLIENT_ID=Y3VFSFRYcTZjVlBnSy03QWlzUng6MTpjaQ
TWITTER_CLIENT_SECRET=M8fIljjR_WyuJW875353RyyNBvf7B9EXIzbhX8XA1UiuNKIvNK

COINAPI_API_KEY=a175c799-be64-4bad-939a-75c868976754
EOF
  echo -e "${GREEN}.env.production file created${NC}"
else
  echo -e "${GREEN}.env.production file exists${NC}"
fi

# Create a .env file for local testing
echo -e "${BLUE}Creating .env file for Vercel build...${NC}"
cp .env.production .env
echo -e "${GREEN}.env file created${NC}"

echo -e "${BLUE}Setting up Google OAuth redirect URLs...${NC}"
echo -e "${YELLOW}Important: Add the following redirect URIs to your Google OAuth credentials:${NC}"
echo -e "  - ${GREEN}https://crypto-dashboard-olive.vercel.app/api/auth/callback/google${NC}"
echo -e "  - ${GREEN}http://localhost:3001/api/auth/callback/google${NC}"

echo -e "${BLUE}Setting up Supabase database schema...${NC}"
echo -e "${YELLOW}Important: Run the SQL script in Supabase SQL Editor:${NC}"
echo -e "${GREEN}$(cat fix-supabase-auth.sql)${NC}"

echo -e "${BLUE}Testing local build...${NC}"
pnpm build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Local build successful! Ready for Vercel deployment.${NC}"
  echo -e "${YELLOW}To deploy, run:${NC}"
  echo -e "${GREEN}vercel --prod${NC}"
else
  echo -e "${RED}Local build failed. Please fix the errors before deploying.${NC}"
  exit 1
fi 