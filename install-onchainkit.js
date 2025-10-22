#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing OnchainKit and updating dependencies...\n');

try {
  // Change to frontend directory
  process.chdir('./frontend');
  
  // Install OnchainKit
  console.log('📦 Installing @coinbase/onchainkit...');
  execSync('npm install @coinbase/onchainkit@^0.31.4', { stdio: 'inherit' });
  
  // Update other dependencies if needed
  console.log('🔄 Updating dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Installation complete!');
  console.log('\n🎯 Next steps:');
  console.log('1. Get a Coinbase API key from https://portal.cdp.coinbase.com/');
  console.log('2. Add REACT_APP_COINBASE_API_KEY to your .env file');
  console.log('3. Start the development server: npm run dev');
  console.log('\n🏷️ Basename Integration Features:');
  console.log('- Automatic basename resolution');
  console.log('- Enhanced user identity display');
  console.log('- Reputation boosts for basename holders');
  console.log('- Cross-ecosystem compatibility');
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}