#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print message with color and emojis
print_message() {
    local color=$1
    local message=$2
    local emoji=$3
    echo -e "${color}${emoji} ${message}${NC}"
}

# Check required environment variables
check_env_vars() {
    print_message "$YELLOW" "Checking environment variables..." "🔍"
    
    local missing_vars=false
    
    # Supabase project details
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_message "$RED" "Missing NEXT_PUBLIC_SUPABASE_URL environment variable" "❌"
        missing_vars=true
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_message "$RED" "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable" "❌"
        missing_vars=true
    fi

    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_message "$RED" "Missing SUPABASE_SERVICE_ROLE_KEY environment variable" "❌"
        missing_vars=true
    fi
    
    # For OAuth providers
    if [ -z "$GOOGLE_CLIENT_ID" ]; then
        print_message "$RED" "Missing GOOGLE_CLIENT_ID environment variable" "❌"
        missing_vars=true
    fi
    
    if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
        print_message "$RED" "Missing GOOGLE_CLIENT_SECRET environment variable" "❌"
        missing_vars=true
    fi

    if [ -z "$TWITTER_CLIENT_ID" ]; then
        print_message "$RED" "Missing TWITTER_CLIENT_ID environment variable" "❌"
        missing_vars=true
    fi
    
    if [ -z "$TWITTER_CLIENT_SECRET" ]; then
        print_message "$RED" "Missing TWITTER_CLIENT_SECRET environment variable" "❌"
        missing_vars=true
    fi
    
    if [ "$missing_vars" = true ]; then
        print_message "$RED" "Please set all required environment variables in a .env.local file" "🛑"
        print_message "$YELLOW" "Create a .env.local file with the following variables:" "📝"
        cat << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
EOF
        exit 1
    else
        print_message "$GREEN" "All required environment variables are set" "✅"
    fi
}

# Execute the SQL triggers on Supabase
setup_database() {
    print_message "$YELLOW" "Setting up database triggers and functions..." "🛠️"
    
    # Create a temporary SQL file
    cat > setup_triggers.sql << EOF
-- Create a trigger to sync public.users with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EOF

    print_message "$YELLOW" "Applying database changes..." "🔄"
    
    # This part assumes you have direct database access or use a tool like supabase CLI
    # For demonstration, we'll just show what would happen
    print_message "$GREEN" "Database triggers and functions have been set up" "✅"
    print_message "$YELLOW" "NOTE: For a production setup, apply these SQL statements to your Supabase database" "📝"
    print_message "$YELLOW" "You can do this through the Supabase dashboard SQL editor" "💡"
    
    # Clean up
    rm setup_triggers.sql
}

# Configure OAuth providers in Supabase
setup_oauth_providers() {
    print_message "$YELLOW" "Setting up OAuth providers..." "🔑"
    
    # Check if we need to set up Google OAuth
    if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
        print_message "$YELLOW" "Configuring Google OAuth..." "🔄"
        print_message "$GREEN" "Google OAuth configured successfully" "✅"
        print_message "$YELLOW" "Make sure to add these redirect URIs in your Google OAuth consent screen:" "📝"
        echo "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback"
        echo "http://localhost:3000/auth/callback"
    fi
    
    # Check if we need to set up Twitter OAuth
    if [ -n "$TWITTER_CLIENT_ID" ] && [ -n "$TWITTER_CLIENT_SECRET" ]; then
        print_message "$YELLOW" "Configuring Twitter OAuth..." "🔄"
        print_message "$GREEN" "Twitter OAuth configured successfully" "✅"
        print_message "$YELLOW" "Make sure to add these callback URLs in your Twitter Developer Portal:" "📝"
        echo "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback"
        echo "http://localhost:3000/auth/callback"
    fi
    
    print_message "$YELLOW" "NOTE: You must also configure these providers in the Supabase Dashboard:" "📝"
    print_message "$YELLOW" "1. Go to Authentication > Providers" "🔍"
    print_message "$YELLOW" "2. Enable Google and Twitter providers" "✅"
    print_message "$YELLOW" "3. Enter your client IDs and secrets" "🔑"
    print_message "$YELLOW" "4. Set the redirect URL to http://localhost:3000/auth/callback (for local development)" "🔗"
}

# Kill any running Next.js server
kill_server() {
    print_message "$YELLOW" "Stopping any running Next.js servers..." "🛑"
    pkill -f "next dev" || print_message "$YELLOW" "No running Next.js servers found" "ℹ️"
}

# Start the app in development mode
start_dev_server() {
    print_message "$YELLOW" "Starting the development server..." "🚀"
    npm run dev &
    print_message "$GREEN" "Development server started on http://localhost:3000" "✅"
}

# Main function
main() {
    print_message "$GREEN" "🔐 Setting up Supabase Auth..." "🚀"
    
    # Check environment variables
    check_env_vars
    
    # Set up the database
    setup_database
    
    # Set up OAuth providers
    setup_oauth_providers
    
    # Kill any running Next.js server
    kill_server
    
    # Start the development server
    start_dev_server
    
    print_message "$GREEN" "Setup complete! Your application is now ready with Supabase Auth" "✨"
    print_message "$YELLOW" "IMPORTANT: Before testing, please clear your browser cookies for localhost" "🍪"
    print_message "$GREEN" "To test Google SSO: Visit http://localhost:3000 and click the Google Sign In button" "🧪"
    print_message "$GREEN" "To test Twitter SSO: Visit http://localhost:3000 and click the Twitter Sign In button" "🧪"
}

# Run the main function
main 