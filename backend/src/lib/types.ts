export interface Contrato {
  id: string
  numero: string
  entidad: string
  objeto: string
  fechaInicio: string
  fechaFin: string
  valor: number
  supervisorNombre: string
  supervisorCargo: string
  contratistaNombre: string
  contratistaCedula: string
  contratistaProfesion: string
}

export interface Actividad {
  id: string
  contratoId: string
  numero: number
  titulo: string
  descripcion: string
  porcentajePeso: number
}

export interface Aporte {
  id: string
  actividadId: string
  fecha: string
  descripcion: string
  evidenciaIds: string[]
  creadoEn: string
}

export interface Evidencia {
  id: string
  actividadId: string
  nombre: string
  tipo: "imagen" | "pdf" | "documento" | "otro"
  tamaño: number
  url: string
  creadoEn: string
}

export interface Informe {
  id: string
  contratoId: string
  periodo: string
  fechaInicio: string
  fechaFin: string
  fechaGeneracion: string
  estado: "borrador" | "finalizado" | "enviado"
  plantilla: string
}

export interface Configuracion {
  contratoId: string
  frecuenciaInforme: "semanal" | "quincenal" | "mensual"
  diaGeneracion: number
  periodoActualInicio: string
  periodoActualFin: string
  plantillaSeleccionada: string
  usuario: {
    nombre: string
    email: string
    notificaciones: boolean
  }
}

export type EstadoInforme = Informe["estado"]
export type TipoEvidencia = Evidencia["tipo"]
export type FrecuenciaInforme = Configuracion["frecuenciaInforme"]
