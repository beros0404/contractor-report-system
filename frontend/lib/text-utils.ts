export function limpiarActividad(texto: string): string {
    if (!texto) return '';
    
    return texto
      .replace(/^[A-Z][a-z]{2,3}:\s*/, '')
      .replace(/^-\s*/, '') 
      .replace(/^\d+\.\s*/, '') 
      .replace(/^[•\-]\s*/, '') 
      .replace(/^[a-z]\)\s*/i, '')
      .replace(/\s+/g, ' ') 
      .trim();
  }

  export function capitalizarPrimera(texto: string): string {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  

  export function formatearActividad(texto: string): string {
    return capitalizarPrimera(limpiarActividad(texto));
  }