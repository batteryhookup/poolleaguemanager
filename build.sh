#!/bin/bash
# Build the React app
npm install terser
npm install
npm run build

# Ensure routing works correctly
cp public/_redirects dist/
cp static.json dist/

# Ensure _redirects file exists in dist
echo "/* /index.html 200" > dist/_redirects

echo "Build completed successfully!"

# Make the script executable
chmod +x build.sh 