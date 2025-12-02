#!/bin/bash

# Deployment setup script for Render
# This script helps prepare your environment variables for deployment

echo "🚀 Online Coding Interview Platform - Render Deployment Setup"
echo ""

# Get frontend URL
read -p "Enter your Render frontend URL (e.g., https://my-app.onrender.com): " FRONTEND_URL

# Get backend URL
read -p "Enter your Render backend URL (e.g., https://my-app-api.onrender.com): " BACKEND_URL

echo ""
echo "📝 Environment Variables for Render:"
echo ""
echo "=== BACKEND SERVICE ==="
echo "Add these environment variables to your backend service:"
echo ""
echo "DEBUG=false"
echo "CORS_ORIGINS=[\"${FRONTEND_URL}\"]"
echo "DATABASE_URL=<internal-database-url>"
echo "REDIS_URL=<internal-redis-url>"
echo ""
echo "Note: DATABASE_URL and REDIS_URL will be auto-populated from services"
echo ""

echo "=== FRONTEND SERVICE ==="
echo "Add this environment variable to your frontend service:"
echo ""
echo "VITE_API_URL=${BACKEND_URL}"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the environment variables above"
echo "2. Add them to your Render services"
echo "3. Redeploy both services"
echo "4. Test the application"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
