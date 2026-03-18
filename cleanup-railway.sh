#!/bin/bash

# Cleanup script for Railway deployment
# Removes unnecessary files and directories

echo "🧹 Cleaning repository for Railway deployment..."
echo ""

# Remove backend test files
echo "Removing backend test files..."
rm -f backend/pytest.ini
rm -f backend/requirements-test.txt
rm -rf backend/tests/
rm -rf backend/app/

# Remove frontend test files
echo "Removing frontend test files..."
rm -f frontend/jest.config.js
rm -f frontend/jest.config.ts
rm -f frontend/jest.setup.ts

# Remove GitHub Actions workflows
echo "Removing GitHub Actions workflows..."
rm -rf .github/

# Remove Render configuration
echo "Removing Render configuration..."
rm -f render.yaml

# Remove Fly.io configuration
echo "Removing Fly.io configuration..."
rm -f backend/fly.toml

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Repository is now ready for Railway deployment."
echo "Run: bash setup-railway.sh"