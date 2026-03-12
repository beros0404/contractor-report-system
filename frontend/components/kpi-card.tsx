import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  titulo: string
  valor: string | number
  descripcion?: string
  icon: LucideIcon
  tendencia?: "up" | "down" | "neutral"
  className?: string
}

export function KpiCard({
  titulo,
  valor,
  descripcion,
  icon: Icon,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {titulo}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-bold tracking-tight text-card-foreground">
          {valor}
        </span>
        {descripcion && (
          <span className="text-xs text-muted-foreground">{descripcion}</span>
        )}
      </div>
    </div>
  )
}
