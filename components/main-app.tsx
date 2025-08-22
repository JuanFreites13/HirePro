"use client"

import { useAuth } from "./auth-provider"
import { LoginPage } from "./login-page"
import { Dashboard } from "./dashboard"
import { PostulationsView } from "./postulations-view"
import { CandidatesView } from "./candidates-view"
import { ProfilePage } from "./profile-page"
import { ConfigurationPage } from "./configuration-page"
import { OptionsPage } from "./options-page"
import { DebugInfo } from "./debug-info"

import { useSupabase } from "@/lib/use-supabase"
import { useState } from "react"

export type Page = "dashboard" | "postulations" | "candidates" | "profile" | "configuration" | "options"

export function MainApp() {
  const { user, isLoading } = useAuth()
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [selectedPostulation, setSelectedPostulation] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />
      case "postulations":
        return (
          <PostulationsView
            onNavigate={setCurrentPage}
            onSelectPostulation={(id) => {
              setSelectedPostulation(id)
              setCurrentPage("dashboard")
            }}
          />
        )
      case "candidates":
        return (
          <CandidatesView
            onNavigate={setCurrentPage}
            onSelectCandidate={(id) => {
              // TODO: Implement candidate detail view
              console.log("Selected candidate:", id)
            }}
            searchTerm={searchTerm}
          />
        )
      case "profile":
        return <ProfilePage onNavigate={setCurrentPage} />
      case "configuration":
        return <ConfigurationPage onNavigate={setCurrentPage} />
      case "options":
        return <OptionsPage onNavigate={setCurrentPage} />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <>
      {renderPage()}
      <DebugInfo />
    </>
  )
}
