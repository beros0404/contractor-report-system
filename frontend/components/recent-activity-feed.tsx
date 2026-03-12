"use client"

import { FileText, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { Aporte, Actividad } from "@/lib/types"

interface RecentActivityFeedProps {
  aportes: Aporte[]
  actividades: Actividad[]
  evidencias?: any[]
}

export function RecentActivityFeed({ aportes, actividades }: RecentActivityFeedProps) {
  const aportesArray = Array.isArray(aportes) ? aportes : []
  
  const sorted = [...aportesArray]
    .sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0
      const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0
      return fechaB - fechaA
    })
    .slice(0, 5)

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay aportes recientes
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {sorted.map((aporte, idx) => {
        const actividad = Array.isArray(actividades) 
          ? actividades.find((a) => a.id === aporte.actividadId)
          : undefined

        const fechaFormateada = aporte.fecha 
          ? format(parseISO(aporte.fecha), "d 'de' MMMM, yyyy", { locale: es })
          : "Fecha no disponible"

        return (
          <div
            key={aporte.id}
            className={`flex gap-3 px-1 py-3 ${
              idx < sorted.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-medium text-foreground">
                {actividad 
                  ? `Act. ${actividad.numero || ''}: ${actividad.titulo?.substring(0, 50)}${actividad.titulo?.length > 50 ? '...' : ''}`
                  : "Actividad sin título"}
              </p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {aporte.descripcion || "Sin descripción"}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
                <Calendar className="h-3 w-3" />
                <span>{fechaFormateada}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}