
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  async getContratos() {
    try {
      const res = await fetch(`${API_URL}/api/contracts`);
      if (!res.ok) throw new Error('Error al cargar contratos');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error cargando contratos:', error);
      throw error;
    }
  },

  async getContrato(id: string) {
    try {
      const res = await fetch(`${API_URL}/api/contracts/${id}`);
      if (!res.ok) throw new Error('Error al cargar contrato');
      return res.json();
    } catch (error) {
      console.error('Error cargando contrato:', error);
      throw error;
    }
  },

  async getContratosPorUsuario(usuarioId: string) {
    try {
      console.log('🔍 apiClient.getContratosPorUsuario - usuarioId:', usuarioId);
      
      if (!usuarioId) {
        throw new Error('usuarioId es requerido');
      }
      
      const res = await fetch(`${API_URL}/api/contracts?usuarioId=${encodeURIComponent(usuarioId)}`);
      
      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al cargar contratos del usuario');
      }
      
      const data = await res.json();
      console.log('✅ Contratos recibidos:', data.length);
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error en getContratosPorUsuario:', error);
      throw error;
    }
  },

  async createContrato(contrato: any) {
    try {
      const res = await fetch(`${API_URL}/api/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contrato)
      });
      if (!res.ok) throw new Error('Error al crear contrato');
      return res.json();
    } catch (error) {
      console.error('Error creando contrato:', error);
      throw error;
    }
  },

  async updateContrato(id: string, contrato: any) {
    try {
      const res = await fetch(`${API_URL}/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contrato,
          actualizadoEn: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error('Error al actualizar contrato');
      return res.json();
    } catch (error) {
      console.error('Error actualizando contrato:', error);
      throw error;
    }
  },

  async deleteContrato(id: string) {
    try {
      const res = await fetch(`${API_URL}/api/contracts/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar contrato');
      return res.json();
    } catch (error) {
      console.error('Error eliminando contrato:', error);
      throw error;
    }
  },

  async getActividades(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/activities?usuarioId=${usuarioId}&contratoId=${contratoId}`);
      if (!res.ok) throw new Error('Error al cargar actividades');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error cargando actividades:', error);
      throw error;
    }
  },

  async getActividad(id: string, usuarioId: string) {
    try {
      console.log(`🔍 getActividad - id: ${id}, usuarioId: ${usuarioId}`);
      const res = await fetch(`${API_URL}/api/activities/${id}?usuarioId=${usuarioId}`);
      if (!res.ok) throw new Error('Error al cargar actividad');
      return res.json();
    } catch (error) {
      console.error('Error cargando actividad:', error);
      throw error;
    }
  },  

  async createActividad(actividad: any, usuarioId: string, contratoId: string) {
    try {
      const res = await fetch(`${API_URL}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...actividad,
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          usuarioId,
          contratoId,
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error('Error al crear actividad');
      return res.json();
    } catch (error) {
      console.error('Error creando actividad:', error);
      throw error;
    }
  },

  async updateActividad(id: string, actividad: any, usuarioId: string) {
    try {
      console.log('🔍 updateActividad - id:', id, 'usuarioId:', usuarioId);
      console.log('📦 actividad a actualizar:', actividad);
      
      const res = await fetch(`${API_URL}/api/activities/${id}?usuarioId=${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...actividad,
          actualizadoEn: new Date().toISOString()
        })
      });
      
      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error al actualizar actividad: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('✅ Actividad actualizada:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando actividad:', error);
      throw error;
    }
  },

  async deleteActividad(id: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/activities/${id}?usuarioId=${usuarioId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar actividad');
      return res.json();
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      throw error;
    }
  },

  async getAportes(contratoId: string, usuarioId: string) {
    try {
      console.log('🔍 getAportes - contratoId:', contratoId, 'usuarioId:', usuarioId);
      
      if (!contratoId || !usuarioId) {
        console.warn('⚠️ contratoId o usuarioId no proporcionados');
        return [];
      }
      
      const url = `${API_URL}/api/aportes?usuarioId=${usuarioId}&contratoId=${contratoId}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error('Error al cargar aportes');
      
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error cargando aportes:', error);
      return []; 
    }
  },

  async getAporte(id: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/aportes/${id}?usuarioId=${usuarioId}`);
      if (!res.ok) throw new Error('Error al cargar aporte');
      return res.json();
    } catch (error) {
      console.error('Error cargando aporte:', error);
      throw error;
    }
  },

  async getAportesByActividad(actividadId: string, usuarioId: string) {
    try {
      console.log(`🔍 getAportesByActividad - actividadId: ${actividadId}, usuarioId: ${usuarioId}`);
      const res = await fetch(`${API_URL}/api/aportes/actividad/${actividadId}?usuarioId=${usuarioId}`);
      if (!res.ok) throw new Error('Error al cargar aportes');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error cargando aportes:', error);
      throw error;
    }
  },

  async createAporte(aporte: any, usuarioId: string, contratoId: string) {
    try {
      console.log('🔍 createAporte - aporte:', aporte, 'usuarioId:', usuarioId, 'contratoId:', contratoId);
      
      const res = await fetch(`${API_URL}/api/aportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aporte,
          id: aporte.id || `AP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          usuarioId,
          contratoId,
          creadoEn: new Date().toISOString()
        })
      });
      
      if (!res.ok) throw new Error('Error al crear aporte');
      return res.json();
    } catch (error) {
      console.error('Error creando aporte:', error);
      throw error;
    }
  },

  async updateAporte(id: string, aporte: any, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/aportes/${id}?usuarioId=${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aporte,
          actualizadoEn: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error('Error al actualizar aporte');
      return res.json();
    } catch (error) {
      console.error('Error actualizando aporte:', error);
      throw error;
    }
  },

  async deleteAporte(id: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/aportes/${id}?usuarioId=${usuarioId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar aporte');
      return res.json();
    } catch (error) {
      console.error('Error eliminando aporte:', error);
      throw error;
    }
  },

  async getEvidencias(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/evidencias?usuarioId=${usuarioId}&contratoId=${contratoId}`);
      if (!res.ok) throw new Error('Error al cargar evidencias');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error cargando evidencias:', error);
      throw error;
    }
  },

  async getEvidencia(id: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/evidencias/${id}?usuarioId=${usuarioId}`);
      if (!res.ok) throw new Error('Error al cargar evidencia');
      return res.json();
    } catch (error) {
      console.error('Error cargando evidencia:', error);
      throw error;
    }
  },

  async getEvidenciasByActividad(actividadId: string, usuarioId: string) {
    try {
      console.log(`🔍 getEvidenciasByActividad - actividadId: ${actividadId}, usuarioId: ${usuarioId}`);
      const res = await fetch(`${API_URL}/api/evidencias/actividad/${actividadId}?usuarioId=${usuarioId}`);
      if (!res.ok) throw new Error('Error al cargar evidencias');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error cargando evidencias:', error);
      throw error;
    }
  },

  async createEvidencia(evidencia: any, usuarioId: string, contratoId: string) {
    try {
      console.log('🔍 createEvidencia - evidencia:', evidencia, 'usuarioId:', usuarioId, 'contratoId:', contratoId);
      
      const res = await fetch(`${API_URL}/api/evidencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...evidencia,
          id: evidencia.id || `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          usuarioId,
          contratoId,
          fecha: evidencia.fecha || new Date().toISOString(),
          creadoEn: new Date().toISOString()
        })
      });
      
      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al crear evidencia');
      }
      
      const data = await res.json();
      console.log('✅ Evidencia creada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creando evidencia:', error);
      throw error;
    }
  },

  async updateEvidencia(id: string, evidencia: any, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/evidencias/${id}?usuarioId=${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...evidencia,
          actualizadoEn: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error('Error al actualizar evidencia');
      return res.json();
    } catch (error) {
      console.error('Error actualizando evidencia:', error);
      throw error;
    }
  },

  async deleteEvidencia(id: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/evidencias/${id}?usuarioId=${usuarioId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar evidencia');
      return res.json();
    } catch (error) {
      console.error('Error eliminando evidencia:', error);
      throw error;
    }
  },

  async getConfiguracion(contratoId: string, usuarioId: string) {
    try {
      console.log('🔍 apiClient.getConfiguracion - contratoId:', contratoId, 'usuarioId:', usuarioId);
      
      if (!contratoId || !usuarioId) {
        throw new Error('contratoId y usuarioId son requeridos');
      }
      
      const url = `${API_URL}/api/configuracion?usuarioId=${encodeURIComponent(usuarioId)}&contratoId=${encodeURIComponent(contratoId)}`;
      console.log('📡 Fetching URL:', url);
      
      const res = await fetch(url);
      
      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al cargar configuración');
      }
      
      const data = await res.json();
      console.log('✅ Configuración cargada:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en getConfiguracion:', error);
      throw error;
    }
  },

  async updateConfiguracion(contratoId: string, usuarioId: string, configuracion: any) {
    try {
      const res = await fetch(`${API_URL}/api/configuracion/${contratoId}?usuarioId=${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracion)
      });
      if (!res.ok) throw new Error('Error al actualizar configuración');
      return res.json();
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      throw error;
    }
  },

  async resetConfiguracion(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/configuracion/${contratoId}/reset?usuarioId=${usuarioId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Error al resetear configuración');
      return res.json();
    } catch (error) {
      console.error('Error reseteando configuración:', error);
      throw error;
    }
  },

  async getInformes(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/informes?usuarioId=${usuarioId}&contratoId=${contratoId}`);
      if (!res.ok) throw new Error('Error al cargar informes');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error cargando informes:', error);
      throw error;
    }
  },

  async getInforme(id: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/informes/${id}?usuarioId=${usuarioId}`);
      if (!res.ok) throw new Error('Error al cargar informe');
      return res.json();
    } catch (error) {
      console.error('Error cargando informe:', error);
      throw error;
    }
  },

  async createInforme(data: any) {
    try {
      const res = await fetch(`${API_URL}/api/informes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al crear informe');
      return res.json();
    } catch (error) {
      console.error('Error creando informe:', error);
      throw error;
    }
  },

  async updateInforme(id: string, informe: any, usuarioId: string) {
    try {
      console.log('🔍 updateInforme - id:', id, 'usuarioId:', usuarioId);
      console.log('📦 informe a actualizar:', JSON.stringify(informe, null, 2));
      
      const res = await fetch(`${API_URL}/api/informes/${id}?usuarioId=${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(informe)
      });
      
      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error al actualizar informe: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('✅ Informe actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando informe:', error);
      throw error;
    }
  },
  
  async deleteInforme(id: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/informes/${id}?usuarioId=${usuarioId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar informe');
      return res.json();
    } catch (error) {
      console.error('Error eliminando informe:', error);
      throw error;
    }
  },
};


export const getContratos = () => apiClient.getContratos();
export const getContrato = (id: string) => apiClient.getContrato(id);
export const getContratosPorUsuario = (usuarioId: string) => apiClient.getContratosPorUsuario(usuarioId);
export const createContrato = (contrato: any) => apiClient.createContrato(contrato);
export const updateContrato = (id: string, contrato: any) => apiClient.updateContrato(id, contrato);
export const deleteContrato = (id: string) => apiClient.deleteContrato(id);

export const getActividades = (contratoId: string, usuarioId: string) => 
  apiClient.getActividades(contratoId, usuarioId);
export const getActividad = (id: string, usuarioId: string) => 
  apiClient.getActividad(id, usuarioId);
export const createActividad = (actividad: any, usuarioId: string, contratoId: string) => 
  apiClient.createActividad(actividad, usuarioId, contratoId);
export const updateActividad = (id: string, actividad: any, usuarioId: string) => 
  apiClient.updateActividad(id, actividad, usuarioId);
export const deleteActividad = (id: string, usuarioId: string) => 
  apiClient.deleteActividad(id, usuarioId);

export const getAportes = (contratoId: string, usuarioId: string) => 
  apiClient.getAportes(contratoId, usuarioId);
export const getAporte = (id: string, usuarioId: string) => 
  apiClient.getAporte(id, usuarioId);
export const getAportesByActividad = (actividadId: string, usuarioId: string) => 
  apiClient.getAportesByActividad(actividadId, usuarioId);
export const createAporte = (aporte: any, usuarioId: string, contratoId: string) => 
  apiClient.createAporte(aporte, usuarioId, contratoId);
export const updateAporte = (id: string, aporte: any, usuarioId: string) => 
  apiClient.updateAporte(id, aporte, usuarioId);
export const deleteAporte = (id: string, usuarioId: string) => 
  apiClient.deleteAporte(id, usuarioId);

export const getEvidencias = (contratoId: string, usuarioId: string) => 
  apiClient.getEvidencias(contratoId, usuarioId);
export const getEvidencia = (id: string, usuarioId: string) => 
  apiClient.getEvidencia(id, usuarioId);
export const getEvidenciasByActividad = (actividadId: string, usuarioId: string) => 
  apiClient.getEvidenciasByActividad(actividadId, usuarioId);
export const createEvidencia = (evidencia: any, usuarioId: string, contratoId: string) => 
  apiClient.createEvidencia(evidencia, usuarioId, contratoId);
export const updateEvidencia = (id: string, evidencia: any, usuarioId: string) => 
  apiClient.updateEvidencia(id, evidencia, usuarioId);
export const deleteEvidencia = (id: string, usuarioId: string) => 
  apiClient.deleteEvidencia(id, usuarioId);

export const getConfiguracion = (contratoId: string, usuarioId: string) => 
  apiClient.getConfiguracion(contratoId, usuarioId);
export const updateConfiguracion = (contratoId: string, usuarioId: string, configuracion: any) => 
  apiClient.updateConfiguracion(contratoId, usuarioId, configuracion);
export const resetConfiguracion = (contratoId: string, usuarioId: string) => 
  apiClient.resetConfiguracion(contratoId, usuarioId);

export const getInformes = (contratoId: string, usuarioId: string) => 
  apiClient.getInformes(contratoId, usuarioId);
export const getInforme = (id: string, usuarioId: string) => 
  apiClient.getInforme(id, usuarioId);
export const createInforme = (data: {
  usuarioId: string;
  contratoId: string;
  tipo: 'mensual' | 'parcial-80' | 'parcial-90';
  año: number;
  mes: number;
  contrato: any;
  actividades: any[];
}) => apiClient.createInforme(data);
export const updateInforme = (id: string, informe: any, usuarioId: string) => 
  apiClient.updateInforme(id, informe, usuarioId);
export const deleteInforme = (id: string, usuarioId: string) => 
  apiClient.deleteInforme(id, usuarioId);