import type { ReactNode } from "react"

interface PageHeaderProps {
  titulo: string
  descripcion?: string
  children?: ReactNode
}

export function PageHeader({ titulo, descripcion, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          {titulo}
        </h1>
        {descripcion && (
          <p className="text-sm text-muted-foreground text-pretty">
            {descripcion}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
