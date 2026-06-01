#!/bin/bash

echo "Setting up ZenduFleet..."

# Use correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
nvm use 22 2>/dev/null || nvm use 20.20.2 2>/dev/null || echo "Warning: Could not switch Node version via nvm. Make sure Node >= 20.19 is active."

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "Done! Run the app with:"
echo "  npm start      → http://localhost:4200"
echo "  npm test       → run 26 unit tests"
echo "  npm run build  → production build"
