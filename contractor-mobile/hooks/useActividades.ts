import { useState, useCallback } from 'react';
import { api } from '../lib/api';

interface Actividad {
  _id?: string;
  id: string;
  titulo: string;
  descripcion: string;
  numero: number;
  porcentajePeso: number;
  estado: string;
  tipo: string;
}

interface UseActividadesReturn {
  actividades: Actividad[];
  loading: boolean;
  error: string | null;
  loadActividades: (contratoId: string, usuarioId: string) => Promise<void>;
  refetch: (contratoId: string, usuarioId: string) => Promise<void>;
  getActividadesByState: (estado: string) => Actividad[];
}

export const useActividades = (): UseActividadesReturn => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActividades = useCallback(
    async (contratoId: string, usuarioId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getActividades(contratoId, usuarioId);
        setActividades(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar actividades';
        setError(errorMessage);
        console.error('Error en useActividades:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(
    async (contratoId: string, usuarioId: string) => {
      await loadActividades(contratoId, usuarioId);
    },
    [loadActividades]
  );

  const getActividadesByState = useCallback(
    (estado: string) => {
      return actividades.filter((a) => a.estado === estado);
    },
    [actividades]
  );

  return {
    actividades,
    loading,
    error,
    loadActividades,
    refetch,
    getActividadesByState,
  };
};
