"use client"

import { useAuth } from "./auth-provider"
import { LoginPage } from "./login-page"
import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { useSupabase } from "@/lib/use-supabase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export type Page = "dashboard" | "postulations" | "candidates" | "profile" | "configuration" | "options"

export function MainApp() {
  const { user, isLoading } = useAuth()
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase()
  const router = useRouter()

  if (isLoading || supabaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">
            {isLoading ? 'Cargando autenticación...' : 'Inicializando Supabase...'}
          </p>
          {supabaseError && (
            <p className="text-sm text-red-600 mt-2">
              Error: {supabaseError}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  // Redirect to dashboard once authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Redirigiendo al dashboard...</p>
      </div>
    </div>
  )
}
