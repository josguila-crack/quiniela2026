// ══════════════════════════════════════════════════════
//  QUINIELA MUNDIAL 2026 — CONFIGURACIÓN
//  Edita solo este archivo para conectar tu Google Sheet
// ══════════════════════════════════════════════════════

const CONFIG = {
  // Pega aquí el ID de tu Google Sheet (la parte larga de la URL)
  // Ejemplo: https://docs.google.com/spreadsheets/d/  ESTE_ID  /edit
  SHEET_ID: 'e/2PACX-1vSuQH49dbNP_GAHhXqZr5XQetgZ9lTLatHA48flP2FXHQGhQVpkKkXcmJiSHhPvJvsJSx377RSaReLD/pub?output=csv',

  // Nombres exactos de cada hoja dentro de tu Google Sheet
  SHEETS: {
    partidos:      'Partidos',      // Hoja con los 72 partidos y marcadores reales
    participantes: 'Participantes', // Hoja con nombres y nicknames
    quinielas:     'Quinielas',     // Hoja con pronósticos de cada uno
    noticias:      'Noticias',      // Hoja con mensajes del organizador
  },

  // Cuántos minutos esperar antes de refrescar los datos
  REFRESH_MINUTES: 5,

  // Nombre del organizador (aparece en el footer)
  ORGANIZADOR: 'Guille',
};
