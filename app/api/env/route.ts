import { NextResponse } from 'next/server'

export async function GET() {
  // Solo exponer las variables necesarias para el cliente
  const clientConfig = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // No exponer la service key por seguridad
  }

  return NextResponse.json(clientConfig)
}



