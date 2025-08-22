// Script to check environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_BACKEND_URL',
  'NEXT_PUBLIC_APP_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'OPENAI_API_KEY'
];

console.log('🔍 Checking environment variables...\n');

const missing = [];
const present = [];

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    present.push(varName);
    console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
  } else {
    missing.push(varName);
    console.log(`❌ ${varName}: MISSING`);
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Present: ${present.length}/${requiredVars.length}`);
console.log(`❌ Missing: ${missing.length}/${requiredVars.length}`);

if (missing.length > 0) {
  console.log('\n🚨 Missing variables:');
  missing.forEach(varName => console.log(`   - ${varName}`));
  process.exit(1);
} else {
  console.log('\n🎉 All environment variables are configured!');
}
