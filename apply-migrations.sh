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
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_message "$RED" "Missing NEXT_PUBLIC_SUPABASE_URL environment variable" "❌"
        return 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_message "$RED" "Missing SUPABASE_SERVICE_ROLE_KEY environment variable" "❌"
        print_message "$YELLOW" "This key is required to run migrations" "⚠️"
        return 1
    fi
    
    return 0
}

# Load environment variables from .env.local if it exists
load_env() {
    if [ -f .env.local ]; then
        print_message "$YELLOW" "Loading environment variables from .env.local..." "📝"
        export $(grep -v '^#' .env.local | xargs)
    else
        print_message "$YELLOW" "No .env.local file found. Using existing environment variables." "⚠️"
    fi
}

# Apply migrations to Supabase
apply_migrations() {
    local migration_file=$1
    local file_name=$(basename "$migration_file")
    
    print_message "$YELLOW" "Applying migration: $file_name..." "🔄"
    
    # Use psql with the Supabase connection string
    # Note: This requires the 'psql' command to be installed and configured
    PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
        -h "$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|^https\?://||' | sed 's|\..*$||').supabase.co" \
        -U postgres \
        -d postgres \
        -f "$migration_file"
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        print_message "$GREEN" "Successfully applied migration: $file_name" "✅"
    else
        print_message "$RED" "Failed to apply migration: $file_name" "❌"
        return 1
    fi
    
    return 0
}

# Apply all migrations
apply_all_migrations() {
    print_message "$YELLOW" "Applying all migrations in supabase/migrations..." "🚀"
    
    local migration_files=(supabase/migrations/*.sql)
    local success=true
    
    for file in "${migration_files[@]}"; do
        if ! apply_migrations "$file"; then
            success=false
            break
        fi
    done
    
    if [ "$success" = true ]; then
        print_message "$GREEN" "All migrations applied successfully" "🎉"
    else
        print_message "$RED" "Not all migrations were applied successfully" "❌"
        return 1
    fi
    
    return 0
}

# Print usage instructions
print_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help            Show this help message"
    echo "  --all                 Apply all migrations"
    echo "  --file <file>         Apply a specific migration file"
    echo ""
    echo "Examples:"
    echo "  $0 --all              Apply all migrations in supabase/migrations/"
    echo "  $0 --file path/to/migration.sql  Apply a specific migration file"
}

# Main function
main() {
    # Load environment variables
    load_env
    
    # Check required environment variables
    if ! check_env_vars; then
        print_message "$RED" "Missing required environment variables. Cannot proceed." "🛑"
        exit 1
    fi
    
    # Parse command line arguments
    if [ $# -eq 0 ]; then
        print_usage
        exit 1
    fi
    
    while [ $# -gt 0 ]; do
        case "$1" in
            -h|--help)
                print_usage
                exit 0
                ;;
            --all)
                apply_all_migrations
                exit $?
                ;;
            --file)
                if [ -z "$2" ]; then
                    print_message "$RED" "No file specified with --file" "❌"
                    exit 1
                fi
                apply_migrations "$2"
                exit $?
                ;;
            *)
                print_message "$RED" "Unknown option: $1" "❌"
                print_usage
                exit 1
                ;;
        esac
        shift
    done
}

# Run the main function with all arguments
main "$@" 