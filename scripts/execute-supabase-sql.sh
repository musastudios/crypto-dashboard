#!/bin/bash

# Get Supabase credentials from .env.local file
source <(grep -E '^(SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=' .env.local)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Supabase credentials not found in .env.local"
  exit 1
fi

# Extract database information from the Supabase URL
DB_HOST=$(echo "$SUPABASE_URL" | sed -E 's|^https?://([^/]+).*|\1|')
DB_NAME="postgres"
DB_USER="postgres"

# Execute the SQL file using curl and the Supabase REST API
execute_sql() {
  SQL_FILE="$1"
  if [ ! -f "$SQL_FILE" ]; then
    echo "Error: SQL file $SQL_FILE not found"
    exit 1
  fi

  echo "Executing SQL from $SQL_FILE..."
  
  # Read SQL file content
  SQL_CONTENT=$(cat "$SQL_FILE")
  
  # Execute SQL via Supabase REST API
  curl -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$SQL_CONTENT\"}"
    
  echo -e "\nSQL execution completed"
}

# Check if a SQL file was provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <sql_file>"
  exit 1
fi

execute_sql "$1" 