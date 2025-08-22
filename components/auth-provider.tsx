"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "@/lib/supabase-service"
import type { Database } from "@/lib/supabase"

export type UserRole = "Admin RRHH" | "Entrevistador"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (newPassword: string) => Promise<boolean>
  isLoading: boolean
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔧 Initializing auth...")
        
        // Check for existing session with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        )
        
        const authPromise = authService.getCurrentUser()
        const currentUser = await Promise.race([authPromise, timeoutPromise]) as User | null
        
        if (currentUser) {
          console.log("✅ User found:", currentUser.email)
          setUser(currentUser)
          localStorage.setItem("currentUser", JSON.stringify(currentUser))
        } else {
          console.log("ℹ️ No user found, checking localStorage...")
          // Fallback to localStorage
          const savedUser = localStorage.getItem("currentUser")
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser)
              console.log("✅ User restored from localStorage:", parsedUser.email)
              setUser(parsedUser)
            } catch (e) {
              console.error("Error parsing saved user:", e)
              localStorage.removeItem("currentUser")
            }
          }
        }

        const savedDarkMode = localStorage.getItem("darkMode")
        if (savedDarkMode === "true") {
          setIsDarkMode(true)
          document.documentElement.classList.add("dark")
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        // Fallback to localStorage on error
        const savedUser = localStorage.getItem("currentUser")
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            console.log("✅ User restored from localStorage after error:", parsedUser.email)
            setUser(parsedUser)
          } catch (e) {
            console.error("Error parsing saved user:", e)
            localStorage.removeItem("currentUser")
          }
        }
      } finally {
        console.log("🔧 Auth initialization complete")
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const user = await authService.login(email, password)
      if (user) {
        setUser(user)
        localStorage.setItem("currentUser", JSON.stringify(user))
        setIsLoading(false)
        
        // Redirigir al dashboard después del login exitoso
        if (typeof window !== 'undefined') {
          console.log('✅ Login exitoso, redirigiendo al dashboard...')
          window.location.href = '/dashboard'
        }
        
        return true
      }
    } catch (error) {
      console.error("Login error:", error)
    }

    setIsLoading(false)
    return false
  }

  // Login con Google deshabilitado (solo email/contraseña)

  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout...')
      await authService.logout()
      console.log('✅ Logout exitoso en Supabase')
    } catch (error) {
      console.error("Logout error:", error)
    }
    
    // Limpiar estado local
    setUser(null)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("darkMode")
    
    // Redirigir a la página de login
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    
    console.log('✅ Logout completado y redirigido')
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode.toString())
    document.documentElement.classList.toggle("dark", newDarkMode)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        resetPassword: authService.resetPassword,
        updatePassword: authService.updatePassword,
        isLoading,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
