#!/bin/bash

# Datenbankinformationen
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DUMP_FILE=/path/to/e-commerce-backend/new_dump_db.sql

# Exportiere die Datenbank
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -F p $DB_NAME > $DUMP_FILE

echo "Database dump updated at $(date)"
