export type EstadoInforme = 'borrador' | 'finalizado' | 'enviado';

export interface Informe {
  id: string;
  contratoId: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaGeneracion: string;
  estado: EstadoInforme;
  plantilla?: string;
  contenido?: any;
}

export type EstadoActividad = 'activa' | 'baja' | 'sin_inicio' | 'completada';
export type TipoActividad = 'automatica' | 'gestion_detectada' | 'ia_sugerida';

export interface Actividad {
  id: string;
  contratoId: string;  
  numero: number;
  titulo: string;
  descripcion: string;
  tipo: TipoActividad;
  porcentajePeso: number;
  estado: EstadoActividad;
  metadata?: {
    fuente?: string;
    prioridad?: 'alta' | 'media' | 'baja';
    fechaExtraccion?: string;
  };
  creadoEn: string;
  actualizadoEn: string;
}

export type EstadoAporte = 'pendiente' | 'completado' | 'rechazado' | 'borrador';

export interface Aporte {
  id: string;
  contratoId: string;  
  actividadId: string;
  monto: number;
  fecha: string;
  estado: EstadoAporte;
  descripcion?: string;
  evidenciaIds?: string[];
  metadata?: {
    tipo?: 'manual' | 'automatico';
    usuario?: string;
  };
}

export type TipoEvidencia = 'imagen' | 'pdf' | 'documento' | 'video' | 'audio' | 'otro';

export interface Evidencia {
  id: string;
  contratoId: string;  
  actividadId: string;
  nombre: string;
  tipo: TipoEvidencia;
  url: string;
  fecha: string;
  tamaño?: number;
  metadata?: {
    originalName?: string;
    mimeType?: string;
  };
}

export interface Contrato {
  _id?: string
  id?: string
  numero: string
  entidad: string
  objeto: string
  fechaInicio: string
  fechaFin: string
  valor: number
  contratistaNombre: string
  contratistaCedula: string
  contratistaProfesion: string
  supervisorNombre: string
  supervisorCargo: string
  // Solo lugar de firma configurable
  lugarFirma?: string
  usuarioId: string
  estado: 'activo' | 'inactivo' | 'finalizado'
  creadoEn: string
  actualizadoEn: string
}

export type FrecuenciaInforme = 'semanal' | 'quincenal' | 'mensual';

export interface ConfiguracionReportes {
  frecuencia: FrecuenciaInforme;
  diaGeneracion: number;
  periodoActualInicio: string;
  periodoActualFin: string;
  plantillaSeleccionada: string;
}

export interface ConfiguracionContrato {
  contratoId: string;
  reportes: ConfiguracionReportes;
  notificaciones: {
    email: boolean;
    diasAnticipacion: number;
  };
}

export interface Configuracion {
  contrato: Contrato;
  reportes: ConfiguracionReportes;
  usuario?: {
    nombre: string;
    email: string;
    notificaciones?: boolean;
  };
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  contratos: string[];  
  contratoActivo: string | null;  
}

export interface KpiData {
  totalActividades: number;
  actividadesCompletadas: number;
  actividadesEnProgreso: number;
  actividadesPendientes: number;
  totalAportes: number;
  totalEvidencias: number;
  diasRestantes: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface FiltroActividades {
  busqueda?: string;
  estado?: EstadoActividad | 'todas';
  tipo?: TipoActividad | 'todos';
  contratoId?: string;
}

export interface FiltroAportes {
  contratoId?: string;
  actividadId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoAporte;
}

export interface FiltroEvidencias {
  contratoId?: string;
  actividadId?: string;
  tipo?: TipoEvidencia;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface EstadisticasActividad {
  actividadId: string;
  titulo: string;
  totalAportes: number;
  totalEvidencias: number;
  cobertura: number; 
  estado: EstadoActividad;
}

export interface EstadisticasContrato {
  contratoId: string;
  numeroContrato: string;
  totalActividades: number;
  actividadesCompletadas: number;
  actividadesEnProgreso: number;
  actividadesPendientes: number;
  totalAportes: number;
  totalEvidencias: number;
  progresoGeneral: number; 
  diasRestantes: number;
}

export interface TranscripcionResponse {
  texto: string
  confidence?: number
  id?: string
}