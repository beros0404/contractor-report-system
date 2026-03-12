"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<"login" | "registro">("login")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
        toast.success("Sesión iniciada correctamente")
        router.push("/configuracion-inicial")
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "contratista"
            }
          }
        })

        if (error) throw error
        toast.success("Registro exitoso. Revisa tu email para confirmar la cuenta")
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">ContraSeguimiento</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sistema de seguimiento contractual
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setModo("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                modo === "login"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setModo("registro")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                modo === "registro"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
                disabled={loading}
                minLength={6}
              />
              {modo === "registro" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Procesando..." : modo === "login" ? "Iniciar Sesión" : "Registrarse"}
            </button>
          </form>

          {modo === "login" && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => setModo("registro")}
                className="text-primary hover:underline"
              >
                Regístrate
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}