"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Autocomplete } from "@/components/ui/autocomplete"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarNavLink,
} from "@/components/ui/sidebar"
import {
  Search,
  Plus,
  Users,
  FileText,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ProfileMenu } from "@/components/profile-menu"
import { NewApplicationModal } from "@/components/new-application-modal"
import { NewCandidateModal } from "@/components/new-candidate-modal"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

interface LayoutWithSidebarProps {
  children: React.ReactNode
}

export function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewApplication, setShowNewApplication] = useState(false)
  const [showNewCandidate, setShowNewCandidate] = useState(false)

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      description: "Mis entrevistas asignadas",
    },
    {
      title: "Postulaciones",
      icon: FileText,
      href: "/postulations",
      description: "Gestionar postulaciones",
    },
    {
      title: "Candidatos",
      icon: Users,
      href: "/candidates",
      description: "Ver todos los candidatos",
    },
    {
      title: "Usuarios",
      icon: Settings,
      href: "/configuration",
      description: "Gestionar usuarios del sistema",
    },
  ]

  const handleLogout = async () => {
    try {
      console.log('🚪 Usuario solicitó cerrar sesión desde sidebar')
      await logout()
      setShowProfileMenu(false)
    } catch (error) {
      console.error('❌ Error en handleLogout del sidebar:', error)
      setShowProfileMenu(false)
    }
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(href) || false
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
        <SidebarHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white p-1">
                <Image 
                  src="/brand/agendapro.png" 
                  alt="Agendapro" 
                  width={24} 
                  height={24} 
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-sidebar-foreground">Agendapro</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <ThemeToggle />
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 md:hidden"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              {/* Desktop toggle button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 hidden md:flex"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Search */}
          <div className="p-4">
            <Autocomplete
              placeholder={sidebarOpen ? "Buscar candidatos..." : ""}
              className={`${sidebarOpen ? 'w-full' : 'w-10'} transition-all duration-300`}
              onSearch={setSearchTerm}
            />
          </div>

          {/* Navigation */}
          <SidebarNav>
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <SidebarNavItem key={item.title}>
                  <SidebarNavLink
                    href={item.href}
                    active={isActive(item.href)}
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(item.href)
                    }}
                    className="w-full"
                    title={!sidebarOpen ? item.description : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span>{item.title}</span>}
                  </SidebarNavLink>
                </SidebarNavItem>
              )
            })}
          </SidebarNav>

          {/* CTA Buttons */}
          <div className="p-4 space-y-3">
            <Button
              onClick={() => setShowNewCandidate(true)}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
              size={sidebarOpen ? "default" : "icon"}
              variant="default"
            >
              <Plus className="h-4 w-4" />
              {sidebarOpen && <span>Nuevo Postulante</span>}
            </Button>
            
            <Button
              onClick={() => setShowNewApplication(true)}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
              size={sidebarOpen ? "default" : "icon"}
              variant="default"
            >
              <Plus className="h-4 w-4" />
              {sidebarOpen && <span>Nueva Postulación</span>}
            </Button>
          </div>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/generic-user-avatar.png" />
              <AvatarFallback>
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-8 w-8"
              >
                <User className="h-4 w-4" />
              </Button>
              {showProfileMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-popover border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => router.push("/options")}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Opciones
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modals */}
      {showNewApplication && <NewApplicationModal onClose={() => setShowNewApplication(false)} />}
      {showNewCandidate && <NewCandidateModal onClose={() => setShowNewCandidate(false)} />}
    </div>
  )
}
