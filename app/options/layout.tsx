import { AuthProvider } from "@/components/auth-provider"
import { LayoutWithSidebar } from "../layout-with-sidebar"

export default function OptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <LayoutWithSidebar>
        {children}
      </LayoutWithSidebar>
    </AuthProvider>
  )
}



