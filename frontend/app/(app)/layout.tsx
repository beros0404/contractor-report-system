"use client"

import { AppShell } from "@/components/app-shell"
import { ContratoProvider, useContrato } from "@/contexts/contrato-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Loader2 } from "lucide-react"

function AppContent({ children }: { children: React.ReactNode }) {
  const { loading } = useContrato()

  console.log('🟣 AppContent - loading:', loading)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  )
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <ContratoProvider>
        <AppContent>{children}</AppContent>
      </ContratoProvider>
    </ProtectedRoute>
  )
}