#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use correct Node version
nvm use

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies
npm install

# Verify installation
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Installation complete!"