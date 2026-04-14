import { useState, useCallback } from 'react';
import { api } from '../lib/api';

interface Contrato {
  _id: string;
  numero: string;
  entidad: string;
  objeto: string;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  contratistaNombre: string;
  supervisorNombre: string;
}

interface UseContratosReturn {
  contratos: Contrato[];
  loading: boolean;
  error: string | null;
  loadContratos: (usuarioId: string) => Promise<void>;
  refetch: (usuarioId: string) => Promise<void>;
}

export const useContratos = (): UseContratosReturn => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContratos = useCallback(async (usuarioId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getContratos(usuarioId);
      // Filtrar solo contratos activos e inactivos
      const contratosFiltrados = data.filter(
        (c: Contrato) => c.estado !== 'finalizado'
      );
      setContratos(contratosFiltrados);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar contratos';
      setError(errorMessage);
      console.error('Error en useContratos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(
    async (usuarioId: string) => {
      await loadContratos(usuarioId);
    },
    [loadContratos]
  );

  return {
    contratos,
    loading,
    error,
    loadContratos,
    refetch,
  };
};
