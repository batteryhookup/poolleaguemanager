#!/bin/bash
# Build the React app
npm install terser
npm install
npm run build

# Ensure routing works correctly
cp public/_redirects dist/
cp public/404.html dist/
cp public/spa-redirect.html dist/

# Ensure _redirects file exists in dist
echo "/* /index.html 200" > dist/_redirects

# Create a 200.html file (some hosts use this for SPA routing)
cp dist/index.html dist/200.html

echo "Build completed successfully!"

# Make the script executable
chmod +x build.sh 