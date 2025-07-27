#!/bin/bash

# Copy fonts to public directory for build
# This script ensures font files are available at runtime

echo "📦 Copying fonts to public directory..."

# Create public/fonts directory if it doesn't exist, or empty it if it does
if [ -d "public/fonts" ]; then
  echo "🧹 Emptying existing public/fonts directory..."
  rm -rf public/fonts/*
else
  echo "📁 Creating public/fonts directory..."
  mkdir -p public/fonts
fi

# Copy all files from src/ui/assets/fonts to public/fonts
echo "📋 Copying all files from src/ui/assets/fonts..."
cp src/ui/assets/fonts/* public/fonts/ 2>/dev/null || echo "⚠️  No files found to copy"

# List what was copied
echo "✅ Files copied to public/fonts:"
ls -la public/fonts/

echo "🎉 Font copy complete!"
