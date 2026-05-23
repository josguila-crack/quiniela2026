# 🏆 Quiniela Mundial 2026 — Guía de Publicación

## Paso 1: Crear tu Google Sheet

Ve a [sheets.google.com](https://sheets.google.com) y crea un nuevo archivo.
Nómbralo: **Quiniela Mundial 2026**

Crea estas **4 hojas** (pestañas) con exactamente estos nombres:

---

### Hoja 1: `Partidos`
Columnas en fila 1:
| grupo | fecha | local | visitante | sede | gol_l | gol_v |
|-------|-------|-------|-----------|------|-------|-------|
| A | 11-Jun | México | Sudáfrica | Ciudad de México | | |
| A | 11-Jun | Corea del Sur | Rep. Checa | Guadalajara | | |
*(llena los 72 partidos — usa el Excel de la quiniela como referencia)*

**Solo tú llenas `gol_l` y `gol_v` conforme se juegan los partidos.**

---

### Hoja 2: `Participantes`
Columnas en fila 1:
| nombre | nick | pts | exactos | ganadores | jugados |
|--------|------|-----|---------|-----------|---------|
| Juan García | El Pulpo | 0 | 0 | 0 | 0 |

**`pts`, `exactos`, `ganadores`, `jugados` los actualizas tú manualmente o con fórmulas.**

---

### Hoja 3: `Quinielas`
Columnas en fila 1:
| nick | partido_1_l | partido_1_v | partido_2_l | partido_2_v | ... |
|------|-------------|-------------|-------------|-------------|-----|

*(Una fila por participante, columnas para cada pronóstico)*

---

### Hoja 4: `Noticias`
Columnas en fila 1:
| fecha | titulo | cuerpo |
|-------|--------|--------|
| Jun 11 2026 | ¡Arrancó el Mundial! | México venció 2-1... |

**Tú agregas filas aquí para publicar mensajes a los participantes.**

---

## Paso 2: Publicar el Sheet como CSV

1. En tu Google Sheet: **Archivo → Compartir → Publicar en la web**
2. Elige **"Todo el documento"** y formato **"Valores separados por comas (.csv)"**
3. Click en **Publicar** y confirma
4. Copia la URL que aparece — solo necesitas el **ID del Sheet** (la parte larga entre `/d/` y `/pub`)

---

## Paso 3: Configurar el sitio web

Abre el archivo `config.js` y reemplaza `TU_SHEET_ID_AQUI` con tu ID:

```js
SHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
```

---

## Paso 4: Publicar en GitHub Pages (GRATIS)

1. Crea cuenta en [github.com](https://github.com) si no tienes
2. Click en **"New repository"** → nombre: `quiniela2026` → Public → Create
3. Sube los 4 archivos: `index.html`, `config.js`, `app.js`, `INSTRUCCIONES_SETUP.md`
   - Click **"uploading an existing file"** → arrastra los archivos → Commit
4. Ve a **Settings → Pages → Source: main / root → Save**
5. En 2-3 minutos tu URL estará activa:
   **`https://TU_USUARIO.github.io/quiniela2026`**

¡Comparte esa URL con todos los participantes! 🎉

---

## Uso diario (cómo actualizar)

| Qué hacer | Dónde |
|-----------|-------|
| Capturar marcador real de un partido | Hoja `Partidos`, columnas `gol_l` y `gol_v` |
| Actualizar puntos de participantes | Hoja `Participantes`, columnas `pts`, `exactos`, etc. |
| Publicar un mensaje/noticia | Hoja `Noticias`, agrega una fila nueva |

La página web **se actualiza sola cada 5 minutos** automáticamente.

---

## ¿Preguntas?
📱 30727775 · josguila@gmail.com
