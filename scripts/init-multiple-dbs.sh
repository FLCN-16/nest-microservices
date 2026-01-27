#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e
# Treat unset variables as an error
set -u

# Function to create user and database with proper permissions
function create_user_and_database() {
	local database=$1
	local user=$2
	local password=$3
	
	echo "  Creating user '$user' and database '$database'..."
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
	    CREATE USER $user WITH PASSWORD '$password';
	    CREATE DATABASE $database OWNER $user;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $user;
EOSQL

	# Grant schema permissions (required for Postgres 15+)
	echo "  Granting schema permissions to '$user' on '$database'..."
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$database" <<-EOSQL
	    GRANT ALL ON SCHEMA public TO $user;
	    GRANT CREATE ON SCHEMA public TO $user;
	    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $user;
	    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $user;
EOSQL
}

# Main execution
if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	for entry in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        # split by colon
        IFS=':' read -r db user pass <<< "$entry"
        
        # default if missing
        user=${user:-$db}
        pass=${pass:-$user}
        
		create_user_and_database $db $user $pass
	done
	echo "Multiple databases created!"
else
    echo "No multiple databases requested."
fi
