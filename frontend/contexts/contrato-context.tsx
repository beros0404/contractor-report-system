"use client"

import { createContext, useState, useEffect, ReactNode, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "./auth-context"
import type { Contrato } from "@/lib/types"

interface ContratoContextType {
  contratoActivo: string | null
  contrato: Contrato | null
  contratos: Contrato[]
  loading: boolean
  tieneContratos: boolean
  usuarioId: string | null
  setContratoActivo: (id: string) => Promise<void>
  refreshContratos: () => Promise<void>
}

const ContratoContext = createContext<ContratoContextType | undefined>(undefined)

export function useContrato() {
  const context = useContext(ContratoContext)
  if (!context) throw new Error("useContrato debe usarse dentro de ContratoProvider")
  return context
}

export function ContratoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [contratoActivo, setContratoActivoState] = useState<string | null>(null)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)

  console.log('🔄 ContratoProvider - user:', user?.id)
  console.log('📍 Pathname:', pathname)

  useEffect(() => {
    if (user?.id) {
      const guardado = localStorage.getItem("contratoActivo")
      if (guardado) {
        console.log('💾 Contrato guardado en localStorage:', guardado)
      }
    } else {
      localStorage.removeItem("contratoActivo")
      setContratos([])
      setContratoActivoState(null)
      setContrato(null)
    }
  }, [user?.id])

  const cargarContratos = async () => {
    try {
      setLoading(true)
      if (!user?.id) {
        console.log('❌ No hay usuario autenticado')
        setContratos([])
        return
      }
      
      console.log('📡 Cargando contratos para usuario:', user.id)
      const data = await apiClient.getContratosPorUsuario(user.id)
      
      console.log('✅ Contratos cargados:', data.length)
      
      const contratosValidos = Array.isArray(data) ? data.filter(c => c && c._id) : []
      setContratos(contratosValidos)
      
      if (contratosValidos.length > 0) {
        console.log('📦 IDs de contratos válidos:', contratosValidos.map(c => ({ _id: c._id, numero: c.numero })))
        
        const guardado = localStorage.getItem("contratoActivo")
        console.log('💾 Contrato guardado en localStorage:', guardado)
        
        const contratoValido = guardado && contratosValidos.some((c: Contrato) => c._id === guardado)
        
        if (contratoValido) {
          console.log('🎯 Usando contrato guardado:', guardado)
          setContratoActivoState(guardado)
          await cargarContrato(guardado)
        } else {
          console.log('🎯 Usando primer contrato:', contratosValidos[0]._id)
          const primerId = contratosValidos[0]._id
          setContratoActivoState(primerId)
          localStorage.setItem("contratoActivo", primerId)
          await cargarContrato(primerId)
        }
      } else {
        console.log('⚠️ No hay contratos válidos para este usuario')
        setContratoActivoState(null)
        setContrato(null)
        localStorage.removeItem("contratoActivo")
      }
    } catch (error) {
      console.error("❌ Error cargando contratos:", error)
      setContratos([])
      setContratoActivoState(null)
      setContrato(null)
    } finally {
      setLoading(false)
    }
  }

  const cargarContrato = async (id: string) => {
    if (!id) {
      console.log('⚠️ ID de contrato inválido')
      return
    }
    
    try {
      console.log('📡 Cargando contrato específico:', id)
      const data = await apiClient.getContrato(id)
      console.log('✅ Contrato cargado:', data?.numero)
      setContrato(data)
    } catch (error) {
      console.error("❌ Error cargando contrato:", error)
      setContrato(null)
    }
  }

  useEffect(() => {
    if (user?.id) {
      cargarContratos()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!loading && user?.id && contratos.length === 0 && pathname !== "/configuracion-inicial") {
      console.log('🚀 Redirigiendo a configuración inicial - sin contratos')
      router.push("/configuracion-inicial")
    }
  }, [loading, user?.id, contratos.length, pathname, router])

  const setContratoActivo = async (id: string) => {
    if (!id) return
    console.log('🔄 Cambiando contrato activo a:', id)
    setContratoActivoState(id)
    localStorage.setItem("contratoActivo", id)
    setContrato(null) 
    await cargarContrato(id)
  }

  const refreshContratos = async () => {
    await cargarContratos()
  }

  return (
    <ContratoContext.Provider value={{
      contratoActivo,
      contrato,
      contratos,
      loading,
      tieneContratos: contratos.length > 0,
      usuarioId: user?.id || null,
      setContratoActivo,
      refreshContratos
    }}>
      {children}
    </ContratoContext.Provider>
  )
}