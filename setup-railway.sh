#!/bin/bash

# Railway Setup Script for Modology Cabinet Designer
# This script automates Railway backend deployment

# Configuration
RAILWAY_TOKEN="339ee8d2-3f81-4830-8368-fa3eeec99f39"
PROJECT_NAME="modology-cabinet-designer"
GITHUB_REPO="MJFlanigan5/modology-cabinet-designer"
BACKEND_DIR="backend"

echo "🚀 Setting up Railway backend for Cabinet Designer..."
echo ""

# Step 1: Login to Railway
echo "📝 Step 1: Logging into Railway..."
railway login --token "$RAILWAY_TOKEN" || {
    echo "❌ Failed to login to Railway"
    echo "Please install Railway CLI: npm install -g @railway/cli"
    exit 1
}
echo "✅ Logged into Railway successfully"
echo ""

# Step 2: Check if project exists or create new
echo "📝 Step 2: Setting up Railway project..."
cd "$BACKEND_DIR" 2>/dev/null || {
    echo "❌ Backend directory not found: $BACKEND_DIR"
    echo "Please run from project root: ./setup-railway.sh"
    exit 1
}

# Try to initialize from existing project
if railway init --name "$PROJECT_NAME" 2>/dev/null; then
    echo "✅ Initialized Railway project: $PROJECT_NAME"
else
    echo "✅ Using existing Railway project"
fi
echo ""

# Step 3: Add PostgreSQL database
echo "📝 Step 3: Adding PostgreSQL database..."
railway add postgresql || {
    echo "❌ Failed to add PostgreSQL database"
    echo "Please add manually via Railway dashboard"
    exit 1
}
echo "✅ PostgreSQL database added"
echo ""

# Step 4: Set environment variables
echo "📝 Step 4: Setting environment variables..."
railway variables set PORT 8000
echo "✅ PORT set to 8000"

# Get DATABASE_URL
DATABASE_URL=$(railway variables get DATABASE_URL --service postgresql 2>/dev/null)
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL retrieved"
    echo "   $DATABASE_URL"
else
    echo "⚠️  Could not retrieve DATABASE_URL automatically"
    echo "   You'll need to get it from Railway dashboard"
fi
echo ""

# Step 5: Deploy to Railway
echo "📝 Step 5: Deploying backend to Railway..."
railway up || {
    echo "❌ Deployment failed"
    exit 1
}
echo "✅ Backend deployed successfully"
echo ""

# Step 6: Get deployment info
echo "📝 Step 6: Retrieving deployment info..."
BACKEND_URL=$(railway domain --service backend 2>/dev/null)
if [ -n "$BACKEND_URL" ]; then
    echo "✅ Backend URL: https://$BACKEND_URL"
else
    echo "⚠️  Could not retrieve backend URL"
fi

PROJECT_ID=$(railway project id 2>/dev/null)
if [ -n "$PROJECT_ID" ]; then
    echo "✅ Project ID: $PROJECT_ID"
else
    echo "⚠️  Could not retrieve project ID"
fi
echo ""

# Step 7: Display connection details
echo "========================================"
echo "✨ Railway Setup Complete!"
echo "========================================"
echo ""
echo "Backend URL: https://$BACKEND_URL"
echo "Project ID: $PROJECT_ID"
echo "Database URL: $DATABASE_URL"
echo ""
echo "Next steps:"
echo "1. Visit https://$BACKEND_URL/init-db to initialize database"
echo "2. Test health endpoint: https://$BACKEND_URL/health"
echo "3. Update GitHub secrets with:"
echo "   - RAILWAY_DATABASE_URL: $DATABASE_URL"
echo "   - RAILWAY_PROJECT_ID: $PROJECT_ID"
echo "   - RAILWAY_TOKEN: $RAILWAY_TOKEN"
echo ""