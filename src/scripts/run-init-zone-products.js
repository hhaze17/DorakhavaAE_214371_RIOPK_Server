const { execSync } = require('child_process');
const path = require('path');

// Get the path to the scripts directory
const scriptsDir = __dirname;
const rootDir = path.resolve(scriptsDir, '..');

// Compile the TypeScript file
console.log('Compiling TypeScript file...');
try {
  execSync('npx tsc src/scripts/initZoneProducts.ts --outDir dist/scripts', {
    cwd: path.resolve(rootDir, '..'),
    stdio: 'inherit'
  });
  console.log('Compilation successful!');
} catch (error) {
  console.error('Error compiling TypeScript file:', error);
  process.exit(1);
}

// Run the compiled JavaScript file
console.log('\nRunning database initialization script...');
try {
  execSync('node dist/scripts/initZoneProducts.js', {
    cwd: path.resolve(rootDir, '..'),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error running database initialization script:', error);
  process.exit(1);
} 