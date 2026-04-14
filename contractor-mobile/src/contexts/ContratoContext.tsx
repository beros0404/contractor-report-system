// src/contexts/ContratoContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../../lib/api'
import { useAuth } from './AuthContext'

interface Contrato {
  id: string
  numero: string
  numeroContrato?: string
  entidad: string
  objeto?: string
  fechaInicio?: string
  fechaFin?: string
  valor?: number
  estado?: string
}

interface ContratoContextType {
  usuarioId: string | null
  contratos: Contrato[]
  contratoActivo: string | null
  contratoActivoData: Contrato | null
  setContratoActivo: (id: string) => void
  loadingContratos: boolean
  refreshContratos: () => Promise<void>
}

const ContratoContext = createContext<ContratoContextType | undefined>(undefined)

const CONTRATO_ACTIVO_KEY = '@contrato_activo'

export function ContratoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [contratoActivo, setContratoActivoState] = useState<string | null>(null)
  const [contratoActivoData, setContratoActivoData] = useState<Contrato | null>(null)
  const [loadingContratos, setLoadingContratos] = useState(true)

  // Obtener usuarioId del usuario autenticado
  useEffect(() => {
    if (user?.id) {
      setUsuarioId(user.id)
    } else {
      setUsuarioId(null)
    }
  }, [user])

  // Guardar contrato activo en AsyncStorage (CORREGIDO)
  const saveContratoActivo = async (id: string | null) => {
    try {
      if (id) {
        await AsyncStorage.setItem(CONTRATO_ACTIVO_KEY, id)
        console.log('💾 Contrato activo guardado:', id)
      } else {
        await AsyncStorage.removeItem(CONTRATO_ACTIVO_KEY)
        console.log('🗑️ Contrato activo eliminado')
      }
    } catch (error) {
      console.error('Error guardando contrato activo:', error)
    }
  }

  // Cargar contrato activo desde AsyncStorage
  const loadContratoActivo = async () => {
    try {
      const saved = await AsyncStorage.getItem(CONTRATO_ACTIVO_KEY)
      return saved
    } catch (error) {
      console.error('Error cargando contrato activo:', error)
      return null
    }
  }

  // Cargar contratos del usuario
  const refreshContratos = useCallback(async () => {
    if (!usuarioId) {
      setContratos([])
      setLoadingContratos(false)
      return
    }

    try {
      setLoadingContratos(true)
      console.log('📡 Cargando contratos para usuario:', usuarioId)
      const data = await api.getContratosByUser(usuarioId)
      const lista = Array.isArray(data) ? data : []
      setContratos(lista)
      console.log(`✅ ${lista.length} contratos cargados`)

      // Si hay un contrato activo guardado localmente, verificar que existe
      const savedContratoId = await loadContratoActivo()
      if (savedContratoId && lista.some(c => c.id === savedContratoId)) {
        setContratoActivoState(savedContratoId)
        const activo = lista.find(c => c.id === savedContratoId)
        setContratoActivoData(activo || null)
      } else if (lista.length > 0) {
        // Seleccionar el primer contrato por defecto
        const primerContrato = lista[0].id
        setContratoActivoState(primerContrato)
        setContratoActivoData(lista[0])
        await saveContratoActivo(primerContrato)
      } else {
        setContratoActivoState(null)
        setContratoActivoData(null)
        await saveContratoActivo(null)
      }
    } catch (error) {
      console.error('Error cargando contratos:', error)
      setContratos([])
    } finally {
      setLoadingContratos(false)
    }
  }, [usuarioId])

  // Función para cambiar contrato activo (CORREGIDO)
  const setContratoActivo = async (id: string) => {
    const contrato = contratos.find(c => c.id === id)
    if (contrato) {
      setContratoActivoState(id)
      setContratoActivoData(contrato)
      await saveContratoActivo(id)
      console.log('📌 Contrato activo cambiado a:', contrato.numero || contrato.numeroContrato)
    }
  }

  // Cargar contratos al iniciar
  useEffect(() => {
    if (usuarioId) {
      refreshContratos()
    }
  }, [usuarioId, refreshContratos])

  return (
    <ContratoContext.Provider
      value={{
        usuarioId,
        contratos,
        contratoActivo,
        contratoActivoData,
        setContratoActivo,
        loadingContratos,
        refreshContratos,
      }}
    >
      {children}
    </ContratoContext.Provider>
  )
}

export function useContrato() {
  const context = useContext(ContratoContext)
  if (context === undefined) {
    throw new Error('useContrato must be used within a ContratoProvider')
  }
  return context
}