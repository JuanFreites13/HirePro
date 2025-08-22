import { AuthProvider } from "@/components/auth-provider"
import { MainApp } from "@/components/main-app"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  return (
    <AuthProvider>
      <MainApp />
      <Toaster />
    </AuthProvider>
  )
}
