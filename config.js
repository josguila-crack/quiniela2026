// ══════════════════════════════════════════════════════
//  QUINIELA MUNDIAL 2026 — CONFIGURACIÓN
//  Edita solo este archivo para conectar tu Google Sheet
// ══════════════════════════════════════════════════════

const CONFIG = {
  // Pega aquí el ID de tu Google Sheet (la parte larga de la URL)
  // Ejemplo: https://docs.google.com/spreadsheets/d/  ESTE_ID  /edit
  SHEET_ID: 'https://docs.google.com/spreadsheets/d/14K9h1TiuoK2YGLNgascY4iI504J89sbipL7akljWP4g/edit?usp=sharing',

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
