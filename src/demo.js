#!/usr/bin/env node

/**
 * Demo script to show the application structure
 * This can run without API keys
 */

console.log('🚀 Textile Company Scraper - Demo\n');

console.log('📋 Project Structure:');
console.log('  ✓ Main entry point: src/index.js');
console.log('  ✓ Google Maps Service: src/services/googleMapsService.js');
console.log('  ✓ Email Service: src/services/emailService.js');
console.log('  ✓ File Handler: src/utils/fileHandler.js\n');

console.log('🔧 Dependencies installed:');
const pkg = require('../package.json');
Object.keys(pkg.dependencies).forEach(dep => {
  console.log(`  ✓ ${dep}`);
});

console.log('\n📝 To run the application:');
console.log('  1. Copy .env.example to .env');
console.log('  2. Add your Google Maps API key');
console.log('  3. (Optional) Add email credentials');
console.log('  4. Run: npm start\n');

console.log('✨ Setup complete! The application is ready to use.');
