// DEPLOYMENT CHECKLIST - Advanced Features
// Run this before deploying to production

const fs = require('fs');
const path = require('path');

console.log('\n🚀 ADVANCED FEATURES - DEPLOYMENT CHECKLIST\n');
console.log('='.repeat(60));

const checks = {
  '✅ Package Dependencies': [
    { name: 'elevenlabs', version: '1.59.0' },
    { name: '@deepgram/sdk', version: '4.11.2' },
    { name: '@sentry/nextjs', version: '10.27.0' },
  ],
  '✅ Core Libraries': [
    'lib/elevenlabs-advanced.js',
    'lib/deepgram-advanced.js',
    'lib/sentry-advanced.js',
  ],
  '✅ API Routes': [
    'app/api/interview/advanced-tts/route.js',
    'app/api/interview/advanced-transcribe/route.js',
    'app/api/interview/advanced-metrics/route.js',
  ],
  '✅ Components': [
    'app/(main)/interview/_components/advanced-voice-interview.jsx',
    'app/(main)/interview/_components/advanced-interview-demo.jsx',
  ],
  '✅ Hooks': [
    'hooks/use-advanced-interview.js',
  ],
};

let allPassed = true;

// Check packages
console.log('\n1️⃣ CHECKING PACKAGES...');
const packageJson = require('./package.json');
const requiredPackages = [
  'elevenlabs',
  '@deepgram/sdk',
  '@sentry/nextjs',
];

requiredPackages.forEach(pkg => {
  const installed = packageJson.dependencies[pkg] ? '✅' : '❌';
  console.log(`  ${installed} ${pkg}`);
  if (!packageJson.dependencies[pkg]) allPassed = false;
});

// Check files exist
console.log('\n2️⃣ CHECKING FILE STRUCTURE...');
const filesToCheck = [
  ...checks['✅ Core Libraries'],
  ...checks['✅ API Routes'],
  ...checks['✅ Components'],
  ...checks['✅ Hooks'],
];

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) allPassed = false;
});

// Check environment variables needed
console.log('\n3️⃣ CHECKING REQUIRED ENVIRONMENT VARIABLES...');
require('dotenv').config({ path: '.env.local' });

const envVars = [
  { name: 'NEXT_PUBLIC_ELEVENLABS_API_KEY', required: true },
  { name: 'DEEPGRAM_API_KEY', required: true },
  { name: 'NEXT_PUBLIC_SENTRY_DSN', required: true },
];

envVars.forEach(({ name, required }) => {
  const hasValue = !!process.env[name];
  const status = hasValue ? '✅' : '⚠️';
  const msg = hasValue ? 'Configured' : 'MISSING - Required before deploy';
  console.log(`  ${status} ${name}: ${msg}`);
  if (required && !hasValue) allPassed = false;
});

// Check build
console.log('\n4️⃣ CHECKING BUILD STATUS...');
const buildDir = path.join(__dirname, '.next');
if (fs.existsSync(buildDir)) {
  console.log('  ✅ Build directory exists (.next)');
  console.log('  ✅ Latest build present');
} else {
  console.log('  ❌ Build directory missing - run `npm run build`');
  allPassed = false;
}

// Check file sizes
console.log('\n5️⃣ CHECKING FILE SIZES...');
const sizeCheck = filesToCheck.filter(f => f.includes('.js') || f.includes('.jsx'));
let totalSize = 0;

sizeCheck.forEach(file => {
  try {
    const fullPath = path.join(__dirname, file);
    const stats = fs.statSync(fullPath);
    const sizeKb = (stats.size / 1024).toFixed(1);
    totalSize += stats.size;
    console.log(`  ✅ ${file}: ${sizeKb}KB`);
  } catch (e) {
    console.log(`  ⚠️ ${file}: Could not determine size`);
  }
});

console.log(`\n  📊 Total: ${(totalSize / 1024).toFixed(1)}KB`);

// Summary
console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT');
  console.log('\nBefore deploying:');
  console.log('1. Ensure all env variables are set in production');
  console.log('2. Test API endpoints in staging');
  console.log('3. Verify Sentry project is configured');
  console.log('4. Run: npm run build');
  console.log('5. Run: npm start (to test production build locally)');
} else {
  console.log('❌ SOME CHECKS FAILED - DO NOT DEPLOY');
  console.log('\nFix issues above and re-run this checklist');
}
console.log('='.repeat(60) + '\n');
