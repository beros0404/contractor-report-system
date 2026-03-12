"use client"

import Link from "next/link"
import { Eye } from "lucide-react"

interface ActivitiesTableProps {
  actividades: any[]
  aportesMap: Record<string, number>
  evidenciasMap: Record<string, number>
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function ActivitiesTable({
  actividades,
  aportesMap,
  evidenciasMap,
  page,
  pageSize,
  total,
  onPageChange
}: ActivitiesTableProps) {
  const totalPages = Math.ceil(total / pageSize)

  const formatearTitulo = (titulo: string) => {
    if (!titulo) return '';
    
    // Limpiar códigos como "Rea · " del inicio
    let tituloLimpio = titulo.replace(/^[A-Z][a-z]{2,3}\s*·\s*/, '');
    
    if (tituloLimpio.length <= 70) return tituloLimpio;
    
    const limite = 70;
    const ultimoPunto = tituloLimpio.lastIndexOf('.', limite);
    const ultimaComa = tituloLimpio.lastIndexOf(',', limite);
    
    const corte = Math.max(ultimoPunto, ultimaComa);
    
    if (corte > 30) {
      return tituloLimpio.substring(0, corte + 1);
    } else {
      return tituloLimpio.substring(0, limite) + '...';
    }
  }

  const getBadgeColor = (cobertura: number) => {
    if (cobertura >= 60) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    if (cobertura >= 25) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actividad Contractual</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Aportes</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Evidencias</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Cobertura</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {actividades.map((actividad, index) => {
              const aportes = aportesMap[actividad.id] || 0
              const evidencias = evidenciasMap[actividad.id] || 0
              const maxAportes = Math.max(...Object.values(aportesMap), 1)
              const cobertura = Math.round((aportes / maxAportes) * 100)
              
              let estado = "SIN INICIO"
              if (cobertura >= 60) estado = "ACTIVA"
              else if (cobertura >= 25) estado = "BAJA"
              
              return (
                <tr key={actividad.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">
                      {formatearTitulo(actividad.titulo)}
                    </div>
                    {actividad.descripcion && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {actividad.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{aportes}</td>
                  <td className="px-4 py-3 text-center text-sm">{evidencias}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${cobertura}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{cobertura}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(cobertura)}`}>
                      {estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/actividades/${actividad.id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Eye className="h-3 w-3" />
                      Ver
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, total)} de {total} actividades
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}