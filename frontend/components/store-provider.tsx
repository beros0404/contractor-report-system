"use client"

import { useEffect, useState, type ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { useContrato } from "@/contexts/contrato-context";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { contratoActivo, loading: contratoLoading } = useContrato();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contratoActivo) {
      return;
    }

    const initializeStore = async () => {
      try {
        await Promise.all([
          apiClient.getActividades(contratoActivo),
          apiClient.getConfiguracion(contratoActivo)
        ]);
        console.log("Store inicializado correctamente para contrato:", contratoActivo);
        setReady(true);
      } catch (error) {
        console.error("Error inicializando store:", error);
        setError("Error al cargar los datos");
      }
    };

    initializeStore();
  }, [contratoActivo]);

  if (contratoLoading || (!ready && contratoActivo)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            {contratoLoading ? "Cargando contrato..." : "Cargando aplicación..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-sm text-primary hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}