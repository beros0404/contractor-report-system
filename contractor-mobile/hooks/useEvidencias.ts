import { useState, useCallback } from 'react';
import { api } from '../lib/api';

interface Evidencia {
  id: string;
  actividadId: string;
  contratoId: string;
  tipo: string;
  nombre: string;
  fecha: string;
  archivo?: {
    nombre: string;
    tamaño: number;
    tipo: string;
  };
  enlace?: {
    url: string;
    titulo: string;
  };
  nota?: {
    contenido: string;
    titulo: string;
  };
}

interface UseEvidenciasReturn {
  evidencias: Evidencia[];
  loading: boolean;
  error: string | null;
  loadEvidencias: (contratoId: string, usuarioId: string) => Promise<void>;
  refetch: (contratoId: string, usuarioId: string) => Promise<void>;
  getEvidenciasByActividad: (actividadId: string) => Evidencia[];
  getEvidenciasByTipo: (tipo: string) => Evidencia[];
}

export const useEvidencias = (): UseEvidenciasReturn => {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvidencias = useCallback(
    async (contratoId: string, usuarioId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getEvidencias(contratoId, usuarioId);
        setEvidencias(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar evidencias';
        setError(errorMessage);
        console.error('Error en useEvidencias:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(
    async (contratoId: string, usuarioId: string) => {
      await loadEvidencias(contratoId, usuarioId);
    },
    [loadEvidencias]
  );

  const getEvidenciasByActividad = useCallback(
    (actividadId: string) => {
      return evidencias.filter((e) => e.actividadId === actividadId);
    },
    [evidencias]
  );

  const getEvidenciasByTipo = useCallback(
    (tipo: string) => {
      return evidencias.filter((e) => e.tipo === tipo);
    },
    [evidencias]
  );

  return {
    evidencias,
    loading,
    error,
    loadEvidencias,
    refetch,
    getEvidenciasByActividad,
    getEvidenciasByTipo,
  };
};
