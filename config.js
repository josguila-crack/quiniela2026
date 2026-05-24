// ══════════════════════════════════════════════════════
//  QUINIELA MUNDIAL 2026 — CONFIGURACIÓN
// ══════════════════════════════════════════════════════

const CONFIG = {
  // ID del Google Sheet (no se usa directamente, está en el Apps Script)
  SHEET_ID: '14K9h1TiuoK2YGLNgascY4iI504J89sbipL7akljWP4g',

  // URL del Apps Script — intermediario que lee el Sheet
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz2LUn0nbBm0avQemy8crqJVqgM24pL9On5TCSxjPPSmnSr5W38ZCe8zLZsGRqyzMsF/exec',

  // Nombres exactos de las hojas
  SHEETS: {
    partidos:      'Partidos',
    participantes: 'Participantes',
    quinielas:     'Quinielas',
    noticias:      'Noticias',
  },

  REFRESH_MINUTES: 5,
  ORGANIZADOR: 'Guille',
};
