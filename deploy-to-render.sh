#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Pool League Manager - Render Deployment Helper${NC}"
echo "This script will help you deploy your changes to Render.com"
echo

# Check if git status is clean
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}You have uncommitted changes. Please commit or stash them before deploying.${NC}"
  git status -s
  exit 1
fi

# Push changes to GitHub
echo -e "${YELLOW}Pushing latest changes to GitHub...${NC}"
git push

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to push changes to GitHub. Please fix the issues and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}Changes pushed to GitHub successfully!${NC}"
echo

# Instructions for manual deployment
echo -e "${YELLOW}To deploy to Render.com:${NC}"
echo
echo "1. Go to your Render dashboard: https://dashboard.render.com/"
echo
echo "2. Deploy the backend service:"
echo "   - Select 'pool-league-manager-backend'"
echo "   - Click 'Manual Deploy'"
echo "   - Select 'Deploy latest commit'"
echo
echo "3. Deploy the frontend service:"
echo "   - Select 'pool-league-manager'"
echo "   - Click 'Manual Deploy'"
echo "   - Select 'Deploy latest commit'"
echo
echo -e "${GREEN}After deployment, check the logs for any errors.${NC}"
echo
echo -e "${YELLOW}Note:${NC} It may take a few minutes for the changes to be deployed and for the services to restart." 