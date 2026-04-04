// lib/api.ts
import Constants from 'expo-constants';
import { supabase } from './supabase';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://tu-backend.onrender.com';

export const api = {
  // Auth
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signUp(email: string, password: string, nombre: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    });
    if (error) throw error;
    return data.user;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    // Asegurar que devolvemos un objeto con la estructura correcta
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
    };
  },

  // Contratos
  async getContratos(usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/contracts?usuarioId=${usuarioId}`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error en getContratos:', error);
      return [];
    }
  },

  async getContrato(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/contracts/${contratoId}?usuarioId=${usuarioId}`);
      if (!res.ok) throw new Error('Error al cargar contrato');
      return await res.json();
    } catch (error) {
      console.error('Error en getContrato:', error);
      return null;
    }
  },

  // Actividades
  async getActividades(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/activities?contratoId=${contratoId}&usuarioId=${usuarioId}`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error en getActividades:', error);
      return [];
    }
  },

  // Aportes
  async getAportes(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/aportes?contratoId=${contratoId}&usuarioId=${usuarioId}`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error('Error al cargar aportes');
      }
      return await res.json();
    } catch (error) {
      console.error('Error en getAportes:', error);
      return [];
    }
  },

  async createAporte(data: any, usuarioId: string, contratoId: string) {
    try {
      const res = await fetch(`${API_URL}/api/aportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, usuarioId, contratoId }),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Error al crear aporte');
      }
      return await res.json();
    } catch (error) {
      console.error('Error en createAporte:', error);
      throw error;
    }
  },

  // Evidencias
  async getEvidencias(contratoId: string, usuarioId: string) {
    try {
      const res = await fetch(`${API_URL}/api/evidencias?contratoId=${contratoId}&usuarioId=${usuarioId}`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error('Error al cargar evidencias');
      }
      return await res.json();
    } catch (error) {
      console.error('Error en getEvidencias:', error);
      return [];
    }
  },

  async uploadEvidence(formData: FormData, usuarioId: string, contratoId: string, actividadId: string) {
    try {
      formData.append('usuarioId', usuarioId);
      formData.append('contratoId', contratoId);
      formData.append('actividadId', actividadId);
      
      const res = await fetch(`${API_URL}/api/evidencias/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir evidencia');
      return await res.json();
    } catch (error) {
      console.error('Error en uploadEvidence:', error);
      throw error;
    }
  },

  async addEvidence(data: any) {
    try {
      const endpoint = data.tipo === 'enlace' 
        ? `${API_URL}/api/evidencias/enlace`
        : data.tipo === 'nota'
        ? `${API_URL}/api/evidencias/nota`
        : `${API_URL}/api/evidencias/upload`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Error al agregar ${data.tipo}`);
      return await res.json();
    } catch (error) {
      console.error('Error en addEvidence:', error);
      throw error;
    }
  },

  // Calendario
  async getEventos(usuarioId: string, timeMin: string, timeMax: string) {
    try {
      const res = await fetch(
        `${API_URL}/api/auth/google/events?usuarioId=${usuarioId}&timeMin=${timeMin}&timeMax=${timeMax}`
      );
      if (!res.ok) {
        if (res.status === 401) return { eventos: [] };
        throw new Error('Error al cargar eventos');
      }
      return await res.json();
    } catch (error) {
      console.error('Error en getEventos:', error);
      return { eventos: [] };
    }
  },
};
