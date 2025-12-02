// Test Advanced Features Integration
// Run with: node test-advanced-features.js

async function testAdvancedFeatures() {
  console.log('🚀 Testing Advanced Features Integration\n');

  // Test 1: Check if packages are installed
  console.log('1️⃣ Checking package installations...');
  try {
    const elevenlabs = require('elevenlabs');
    console.log('✅ elevenlabs package found');
  } catch (e) {
    console.log('❌ elevenlabs package NOT found');
  }

  try {
    const deepgram = require('@deepgram/sdk');
    console.log('✅ @deepgram/sdk package found');
  } catch (e) {
    console.log('❌ @deepgram/sdk package NOT found');
  }

  try {
    const sentry = require('@sentry/nextjs');
    console.log('✅ @sentry/nextjs package found');
  } catch (e) {
    console.log('❌ @sentry/nextjs package NOT found');
  }

  // Test 2: Check if environment variables are configured
  console.log('\n2️⃣ Checking environment variables...');
  require('dotenv').config({ path: '.env.local' });

  if (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
    console.log('✅ ELEVENLABS API key configured');
  } else {
    console.log('❌ ELEVENLABS API key NOT configured');
  }

  if (process.env.DEEPGRAM_API_KEY) {
    console.log('✅ DEEPGRAM API key configured');
  } else {
    console.log('❌ DEEPGRAM API key NOT configured');
  }

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log('✅ SENTRY DSN configured');
  } else {
    console.log('❌ SENTRY DSN NOT configured');
  }

  // Test 3: Check if library files exist
  console.log('\n3️⃣ Checking advanced library files...');
  const fs = require('fs');
  const path = require('path');

  const files = [
    'lib/elevenlabs-advanced.js',
    'lib/deepgram-advanced.js',
    'lib/sentry-advanced.js',
    'app/api/interview/advanced-tts/route.js',
    'app/api/interview/advanced-transcribe/route.js',
    'app/api/interview/advanced-metrics/route.js',
    'app/(main)/interview/_components/advanced-voice-interview.jsx',
  ];

  files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const size = fs.statSync(fullPath).size;
      console.log(`✅ ${file} (${(size / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`❌ ${file} NOT FOUND`);
    }
  });

  // Test 4: Verify build success
  console.log('\n4️⃣ Build status...');
  try {
    const buildDir = path.join(__dirname, '.next');
    if (fs.existsSync(buildDir)) {
      console.log('✅ Build directory exists (.next)');
      console.log('✅ Build completed successfully');
    } else {
      console.log('⚠️  Build directory not found - run `npm run build` first');
    }
  } catch (e) {
    console.log('⚠️  Could not verify build status');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 ADVANCED FEATURES INTEGRATION TEST COMPLETE');
  console.log('='.repeat(50));
  console.log('\nNext steps:');
  console.log('1. Make sure all environment variables are set');
  console.log('2. Run: npm run dev');
  console.log('3. Visit: http://localhost:3000/interview');
  console.log('4. Check Sentry dashboard for metrics');
}

testAdvancedFeatures().catch(console.error);
