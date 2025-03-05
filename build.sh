#!/bin/bash
# Build the React app
npm install
npm run build

# Ensure routing works correctly
cp public/_redirects dist/
cp static.json dist/

echo "Build completed successfully!"

# Make the script executable
chmod +x build.sh 