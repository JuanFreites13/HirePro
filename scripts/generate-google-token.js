const { google } = require('googleapis')
const readline = require('readline')

// Configuración de Google Cloud Platform
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET_HERE'
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback'

if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_GOOGLE_CLIENT_SECRET_HERE') {
  console.log('❌ Error: Necesitas configurar tus credenciales de Google Cloud')
  console.log('\n📋 Pasos para obtener las credenciales:')
  console.log('1. Ve a https://console.cloud.google.com')
  console.log('2. Crea un proyecto o selecciona uno existente')
  console.log('3. Habilita Google Calendar API')
  console.log('4. Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"')
  console.log('5. Configura las URIs de redirección autorizadas:')
  console.log('   - http://localhost:3000/auth/google/callback')
  console.log('   - https://tu-dominio-vercel.vercel.app/auth/google/callback')
  console.log('6. Copia el CLIENT_ID y CLIENT_SECRET')
  console.log('\n💡 Alternativa: Crea un archivo .env.local con:')
  console.log('GOOGLE_CLIENT_ID=tu_client_id')
  console.log('GOOGLE_CLIENT_SECRET=tu_client_secret')
  console.log('\nLuego ejecuta: node scripts/generate-google-token.js')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
})

console.log('🔗 URL de autorización:')
console.log(authUrl)
console.log('\n📋 Pasos:')
console.log('1. Copia y pega la URL en tu navegador')
console.log('2. Inicia sesión con tu cuenta de Google')
console.log('3. Autoriza la aplicación')
console.log('4. Copia el código de autorización de la URL de redirección')
console.log('5. Pégalo aquí cuando te lo solicite')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('\nPega el código de autorización aquí: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    console.log('\n✅ Token obtenido exitosamente!')
    console.log('\n📝 Agrega estas variables a tu archivo .env.local:')
    console.log('\n# Google API Configuration')
    console.log(`GOOGLE_CLIENT_ID=${oauth2Client._clientId}`)
    console.log(`GOOGLE_CLIENT_SECRET=${oauth2Client._clientSecret}`)
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback')
    
    console.log('\n🔑 Refresh Token:')
    console.log(tokens.refresh_token)
    
    console.log('\n⚠️  IMPORTANTE:')
    console.log('- Guarda el refresh_token de forma segura')
    console.log('- No lo compartas ni lo subas a repositorios públicos')
    console.log('- Este token no expira a menos que revoques el acceso')
    console.log('\n🚀 Para Vercel:')
    console.log('- Ve a tu dashboard de Vercel')
    console.log('- Settings → Environment Variables')
    console.log('- Actualiza GOOGLE_REFRESH_TOKEN con el nuevo valor')
    
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message)
  } finally {
    rl.close()
  }
})
