"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useContrato } from "@/contexts/contrato-context"
import { apiClient } from "@/lib/api-client"
import { KpiCard } from "@/components/kpi-card"
import { ActivityProgressChart } from "@/components/activity-progress-chart"
import { RecentActivityFeed } from "@/components/recent-activity-feed"
import { ContractSummaryCard } from "@/components/contract-summary-card"
import { CalendarEvents } from "@/components/calendar-events"
import { differenceInDays, parseISO } from "date-fns"
import { ClipboardList, FileCheck, ImageIcon, CalendarClock, Loader2 } from "lucide-react"
import type { Actividad, Aporte, Evidencia } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const { contratoActivo, contrato: contratoInfo, usuarioId, tieneContratos, loading: contratoLoading } = useContrato()
  
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [aportes, setAportes] = useState<Aporte[]>([])
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [loading, setLoading] = useState(true)

  console.log('📊 Dashboard - contratoActivo:', contratoActivo)

  useEffect(() => {
    if (!contratoActivo || !usuarioId) {
      setLoading(false)
      return
    }

    const cargarDatos = async () => {
      setLoading(true)
      console.log(`📡 Cargando datos para contrato: ${contratoActivo}`)
      
      try {
        const [acts, aps, evids] = await Promise.all([
          apiClient.getActividades(contratoActivo, usuarioId),
          apiClient.getAportes(contratoActivo, usuarioId),
          apiClient.getEvidencias(contratoActivo, usuarioId)
        ])

        console.log('✅ Actividades cargadas:', acts.length)
        console.log('✅ Aportes cargados:', aps.length)
        console.log('✅ Evidencias cargadas:', evids.length)

        setActividades(acts)
        setAportes(aps)
        setEvidencias(evids)
      } catch (error) {
        console.error('❌ Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [contratoActivo, usuarioId])

  if (contratoLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tieneContratos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground mb-4">No tienes contratos configurados</p>
        <button
          onClick={() => router.push("/configuracion-inicial")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Crear contrato
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const actividadesArray = Array.isArray(actividades) ? actividades : []
  const aportesArray = Array.isArray(aportes) ? aportes : []
  const evidenciasArray = Array.isArray(evidencias) ? evidencias : []

  const contratoData = contratoInfo || {
    numeroContrato: contratoActivo?.substring(0, 8) || "Sin contrato",
    entidadContratante: "No especificada",
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    valorTotalHonorarios: 0
  }

  const diasRestantes = contratoData.fechaFin 
    ? Math.max(0, differenceInDays(parseISO(contratoData.fechaFin), new Date()))
    : 0

  const actividadesCompletadas = actividadesArray.filter(a => a.estado === 'completada').length
  const actividadesPendientes = actividadesArray.filter(a => a.estado === 'sin_inicio').length

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Contrato {contratoData.numeroContrato} - {contratoData.entidadContratante}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="Total Actividades"
          valor={actividadesArray.length}
          descripcion={`${actividadesCompletadas} completadas, ${actividadesPendientes} pendientes`}
          icon={ClipboardList}
        />
        <KpiCard
          titulo="Aportes Registrados"
          valor={aportesArray.length}
          descripcion="En el periodo actual"
          icon={FileCheck}
        />
        <KpiCard
          titulo="Evidencias Cargadas"
          valor={evidenciasArray.length}
          descripcion="Archivos de soporte"
          icon={ImageIcon}
        />
        <KpiCard
          titulo="Días Restantes"
          valor={diasRestantes}
          descripcion="Hasta fin de contrato"
          icon={CalendarClock}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ActivityProgressChart
            actividades={actividadesArray}
            aportes={aportesArray}
          />
          <RecentActivityFeed
            aportes={aportesArray}
            actividades={actividadesArray}
            evidencias={evidenciasArray}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ContractSummaryCard
            contrato={contratoData}
            configuracion={undefined}
          />
          <CalendarEvents />
        </div>
      </div>
    </div>
  )
}