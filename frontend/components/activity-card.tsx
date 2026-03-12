"use client"

import Link from "next/link"
import { FileText, Image, ArrowRight } from "lucide-react"
import type { Actividad } from "@/lib/types"

interface ActivityCardProps {
  actividad: Actividad
  aportesCount: number
  evidenciasCount: number
}

export function ActivityCard({
  actividad,
  aportesCount,
  evidenciasCount,
}: ActivityCardProps) {
  return (
    <Link
      href={`/actividades/${actividad.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
          {actividad.numero}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-card-foreground leading-snug text-balance">
          {actividad.titulo}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {actividad.descripcion}
        </p>
      </div>
      <div className="mt-auto flex items-center gap-4 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>
            {aportesCount} {aportesCount === 1 ? "aporte" : "aportes"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Image className="h-3.5 w-3.5" />
          <span>
            {evidenciasCount}{" "}
            {evidenciasCount === 1 ? "evidencia" : "evidencias"}
          </span>
        </div>
        <div className="ml-auto">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {actividad.porcentajePeso}%
          </span>
        </div>
      </div>
    </Link>
  )
}
