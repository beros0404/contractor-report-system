export function limpiarActividad(texto: string): string {
    if (!texto) return '';
    
    return texto
      .replace(/^[A-Z][a-z]{2,3}:\s*/, '') // Quitar "Rea:", "For:", "Apo:", "Des:", "Y I:"
      .replace(/^-\s*/, '') // Quitar guiones
      .replace(/^\d+\.\s*/, '') // Quitar números con punto
      .replace(/^[•\-]\s*/, '') // Quitar viñetas
      .replace(/^[a-z]\)\s*/i, '') // Quitar "a)" etc.
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  export function capitalizarPrimera(texto: string): string {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  

  export function formatearActividad(texto: string): string {
    return capitalizarPrimera(limpiarActividad(texto));
  }