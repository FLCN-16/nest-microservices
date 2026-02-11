#!/usr/bin/env bash
# Generate cryptographically secure secrets for .env files
# Usage: ./scripts/generate-secrets.sh

set -euo pipefail

echo "=== The Falcon — Secret Generator ==="
echo ""
echo "Copy these into your .env files:"
echo ""
echo "# Auth Service (.env.development)"
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo ""
echo "# Gateway Service (.env.development)"
echo "GATEWAY_SECRET=$(openssl rand -base64 48)"
echo ""
echo "# Database Passwords (change defaults)"
echo "DB_PASSWORD=$(openssl rand -base64 24)"
echo "FEED_DB_PASSWORD=$(openssl rand -base64 24)"
echo "NOTIFICATIONS_DB_PASSWORD=$(openssl rand -base64 24)"
echo ""
echo "Done. Never commit these values to version control."
