// ══════════════════════════════════════════════════════
//  QUINIELA MUNDIAL 2026 — APP
// ══════════════════════════════════════════════════════

const DEMO_MODE = CONFIG.SHEET_ID === 'TU_SHEET_ID_AQUI';

// ── TAB NAVIGATION ────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// ── GOOGLE SHEETS CSV FETCH ───────────────────────────
async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo cargar la hoja: ' + sheetName);
  const text = await res.text();
  return parseCSV(text);
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g,'').trim());
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] ?? '');
    return obj;
  });
}

// ── DEMO DATA ─────────────────────────────────────────
function getDemoData() {
  const participantes = [
    {nick:'El Pulpo',      pts:38, exactos:5, ganadores:9, jugados:14},
    {nick:'La Pantera',    pts:32, exactos:4, ganadores:8, jugados:14},
    {nick:'Toro',          pts:28, exactos:3, ganadores:7, jugados:14},
    {nick:'Reina del Sur', pts:26, exactos:2, ganadores:9, jugados:14},
    {nick:'El Profe',      pts:24, exactos:3, ganadores:6, jugados:14},
    {nick:'Lobo Gris',     pts:22, exactos:2, ganadores:7, jugados:14},
    {nick:'La Máquina',    pts:20, exactos:2, ganadores:6, jugados:14},
    {nick:'Campeón 98',    pts:18, exactos:1, ganadores:7, jugados:14},
  ];

  const partidos = [
    {grupo:'A', fecha:'11-Jun', local:'México', visitante:'Sudáfrica', sede:'Ciudad de México', gol_l:'2', gol_v:'1'},
    {grupo:'A', fecha:'11-Jun', local:'Corea del Sur', visitante:'Rep. Checa', sede:'Guadalajara', gol_l:'', gol_v:''},
    {grupo:'B', fecha:'12-Jun', local:'Canadá', visitante:'Bosnia-Herz.', sede:'Toronto', gol_l:'', gol_v:''},
    {grupo:'B', fecha:'13-Jun', local:'Qatar', visitante:'Suiza', sede:'San Francisco', gol_l:'', gol_v:''},
    {grupo:'C', fecha:'13-Jun', local:'Brasil', visitante:'Marruecos', sede:'Nueva York/NJ', gol_l:'', gol_v:''},
  ];

  const noticias = [
    {fecha:'Jun 11 2026', titulo:'¡Arrancó el Mundial!', cuerpo:'México venció 2-1 a Sudáfrica en el partido inaugural. ¡Gran inicio! Actualizaré los marcadores conforme se jueguen.'},
    {fecha:'Jun 10 2026', titulo:'Quinielas cerradas', cuerpo:'Ya están cerrados todos los pronósticos. El Excel consolidado fue enviado a todos. ¡Buena suerte a todos!'},
    {fecha:'Jun 07 2026', titulo:'Último día para enviar', cuerpo:'Hoy es el límite. Hasta las 20:00 hrs se reciben quinielas. ¡Muchos ánimos!'},
  ];

  return { participantes, partidos, noticias };
}

// ── RENDER CLASIFICACIÓN ──────────────────────────────
function renderClasificacion(data) {
  const sorted = [...data].sort((a,b) => {
    const pa = parseInt(a.pts||a.puntos||0), pb = parseInt(b.pts||b.puntos||0);
    if (pb !== pa) return pb - pa;
    return parseInt(b.exactos||0) - parseInt(a.exactos||0);
  });

  // Stats
  const totalJugados = sorted.length > 0 ? parseInt(sorted[0].jugados||0) : 0;
  const leader = sorted[0];
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="val">${sorted.length}</div><div class="lbl">Participantes</div></div>
    <div class="stat-card"><div class="val">${totalJugados}</div><div class="lbl">Partidos Jugados</div></div>
    <div class="stat-card"><div class="val">${leader ? leader.pts||leader.puntos||0 : 0}</div><div class="lbl">Puntos Líder</div></div>
    <div class="stat-card"><div class="val">${72 - totalJugados}</div><div class="lbl">Por Jugar</div></div>
  `;

  // Podium
  const medals = ['🥇','🥈','🥉'];
  const classes = ['first','second','third'];
  const podiumHTML = [1,0,2].map(i => {
    const p = sorted[i];
    if (!p) return '';
    return `<div class="podium-item ${classes[i]}">
      <span class="podium-medal">${medals[i]}</span>
      <div class="podium-name">${p.nick||p.nickname||p.nombre||'—'}</div>
      <div class="podium-pts">${p.pts||p.puntos||0}<span> pts</span></div>
    </div>`;
  }).join('');
  document.getElementById('podium').innerHTML = podiumHTML;

  // Table
  const tbody = document.getElementById('ranking-body');
  tbody.innerHTML = sorted.map((p, i) => {
    const rank = i + 1;
    const badgeClass = rank <= 3 ? `rank-${rank}` : 'rank-n';
    const name = p.nick || p.nickname || p.nombre || '—';
    const pts = p.pts || p.puntos || 0;
    const exactos = p.exactos || 0;
    const ganadores = p.ganadores || 0;
    const jugados = p.jugados || 0;
    return `<tr class="${rank<=3?'top3':''}">
      <td><span class="rank-badge ${badgeClass}">${rank}</span></td>
      <td>${name}</td>
      <td class="pts-cell">${pts}</td>
      <td class="exact-cell">${exactos}</td>
      <td>${ganadores}</td>
      <td>${jugados}</td>
    </tr>`;
  }).join('');
}

// ── RENDER PARTIDOS ───────────────────────────────────
function renderPartidos(data) {
  const grupos = {};
  data.forEach(p => {
    const g = p.grupo || p.grp || p.GRUPO || 'A';
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(p);
  });

  const flagMap = {
    'México':'🇲🇽','México':'🇲🇽','Sudáfrica':'🇿🇦','Corea del Sur':'🇰🇷','Rep. Checa':'🇨🇿',
    'Canadá':'🇨🇦','Bosnia-Herz.':'🇧🇦','Qatar':'🇶🇦','Suiza':'🇨🇭',
    'Brasil':'🇧🇷','Marruecos':'🇲🇦','Haití':'🇭🇹','Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'EE.UU.':'🇺🇸','Paraguay':'🇵🇾','Australia':'🇦🇺','Turquía':'🇹🇷',
    'Alemania':'🇩🇪','Curazao':'🇨🇼','Costa de Marfil':'🇨🇮','Ecuador':'🇪🇨',
    'Países Bajos':'🇳🇱','Japón':'🇯🇵','Suecia':'🇸🇪','Túnez':'🇹🇳',
    'Bélgica':'🇧🇪','Egipto':'🇪🇬','Irán':'🇮🇷','Nueva Zelanda':'🇳🇿',
    'España':'🇪🇸','Cabo Verde':'🇨🇻','Arabia Saudita':'🇸🇦','Uruguay':'🇺🇾',
    'Francia':'🇫🇷','Senegal':'🇸🇳','Noruega':'🇳🇴','Irak':'🇮🇶',
    'Argentina':'🇦🇷','Argelia':'🇩🇿','Austria':'🇦🇹','Jordania':'🇯🇴',
    'Portugal':'🇵🇹','R.D. Congo':'🇨🇩','Uzbekistán':'🇺🇿','Colombia':'🇨🇴',
    'Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croacia':'🇭🇷','Ghana':'🇬🇭','Panamá':'🇵🇦',
  };

  const getFlag = name => flagMap[name] || '🏳️';

  const html = Object.entries(grupos).map(([grp, matches]) => `
    <div class="group-section">
      <div class="group-header">
        <span class="group-label">GRUPO ${grp}</span>
        <span class="group-title">${getGroupTeams(matches)}</span>
      </div>
      ${matches.map(m => {
        const hasScore = m.gol_l !== '' && m.gol_v !== '' && m.gol_l !== undefined;
        return `<div class="match-card ${hasScore?'played':''}">
          <div class="team">
            <span class="team-flag">${getFlag(m.local||m.LOCAL||'')}</span>
            <span class="team-name">${m.local||m.LOCAL||''}</span>
          </div>
          <div class="score-box">
            ${hasScore
              ? `<div class="score-nums">${m.gol_l} – ${m.gol_v}</div>`
              : `<div class="score-pending">VS</div>`}
            <div class="score-date">${m.fecha||m.FECHA||''}</div>
            <div class="score-venue">${m.sede||m.SEDE||''}</div>
          </div>
          <div class="team away">
            <span class="team-flag">${getFlag(m.visitante||m.VISITANTE||'')}</span>
            <span class="team-name">${m.visitante||m.VISITANTE||''}</span>
          </div>
        </div>`;
      }).join('')}
    </div>
  `).join('');

  document.getElementById('matches-container').innerHTML = html;
}

function getGroupTeams(matches) {
  const teams = new Set();
  matches.forEach(m => { teams.add(m.local||m.LOCAL||''); teams.add(m.visitante||m.VISITANTE||''); });
  return [...teams].slice(0,4).join(' · ');
}

// ── RENDER QUINIELAS ──────────────────────────────────
function renderQuinielas(participantes) {
  if (!participantes.length) {
    document.getElementById('quinielas-container').innerHTML =
      '<div class="error-msg">No hay quinielas cargadas aún.</div>';
    return;
  }
  const html = `
    <p style="color:var(--muted);font-size:0.85rem;margin-bottom:20px">
      Selecciona un participante para ver su quiniela completa.
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px">
      ${participantes.map((p,i) => `
        <button onclick="showQuiniela(${i})" id="qbtn-${i}"
          style="padding:8px 16px;background:var(--card);border:1px solid var(--border);
                 border-radius:8px;color:var(--cream);font-family:'Rajdhani',sans-serif;
                 font-size:0.88rem;font-weight:600;cursor:pointer;transition:all .2s"
          onmouseover="this.style.borderColor='var(--gold)'"
          onmouseout="this.style.borderColor='var(--border)'">
          ${p.nick||p.nickname||p.nombre||'Participante '+(i+1)}
        </button>
      `).join('')}
    </div>
    <div id="quiniela-detail" style="color:var(--muted);font-size:0.85rem;text-align:center;padding:20px">
      Selecciona un participante arriba ↑
    </div>`;
  document.getElementById('quinielas-container').innerHTML = html;
  window._quinielasData = participantes;
}

function showQuiniela(idx) {
  const p = window._quinielasData[idx];
  const name = p.nick || p.nickname || p.nombre || 'Participante';
  document.getElementById('quiniela-detail').innerHTML = `
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--gold-lt);margin-bottom:16px">
      Quiniela de ${name}
    </div>
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>GRP</th><th>FECHA</th><th>LOCAL</th><th>PRON</th><th>VISITANTE</th><th>REAL</th><th>PTS</th></tr></thead>
        <tbody>
          ${Object.keys(p).filter(k => !['nick','nickname','nombre','pts','puntos','exactos','ganadores','jugados'].includes(k))
            .map(k => `<tr><td colspan="7" style="color:var(--muted);font-size:0.8rem">${k}: ${p[k]}</td></tr>`)
            .join('') || '<tr><td colspan="7" style="color:var(--muted)">Conecta el Google Sheet para ver pronósticos detallados</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

// ── RENDER NOTICIAS ───────────────────────────────────
function renderNoticias(data) {
  if (!data.length) {
    document.getElementById('news-container').innerHTML =
      '<div class="error-msg">No hay noticias publicadas aún.</div>';
    return;
  }
  document.getElementById('news-container').innerHTML = data.map(n => `
    <div class="news-card">
      <div class="news-date">${n.fecha || n.FECHA || ''}</div>
      <div class="news-title">${n.titulo || n.TITULO || 'Noticia'}</div>
      <div class="news-body">${n.cuerpo || n.CUERPO || n.mensaje || ''}</div>
    </div>
  `).join('');
}

// ── MAIN LOAD ─────────────────────────────────────────
async function loadAll() {
  if (DEMO_MODE) {
    // Show demo data when not configured
    const demo = getDemoData();
    renderClasificacion(demo.participantes);
    renderPartidos(demo.partidos);
    renderQuinielas(demo.participantes);
    renderNoticias(demo.noticias);

    // Show setup guide only in demo mode
    document.getElementById('setup-guide').style.display = 'block';
    return;
  }

  document.getElementById('setup-guide').style.display = 'none';

  try {
    const [partidos, participantes, noticias] = await Promise.all([
      fetchSheet(CONFIG.SHEETS.partidos),
      fetchSheet(CONFIG.SHEETS.participantes),
      fetchSheet(CONFIG.SHEETS.noticias),
    ]);
    renderClasificacion(participantes);
    renderPartidos(partidos);
    renderQuinielas(participantes);
    renderNoticias(noticias);
  } catch(err) {
    console.error(err);
    document.querySelectorAll('.loader').forEach(el => {
      el.outerHTML = `<div class="error-msg">
        Error cargando datos.<br>
        Verifica que el Google Sheet esté publicado como CSV.<br>
        <a href="INSTRUCCIONES_SETUP.md">Ver instrucciones →</a>
      </div>`;
    });
  }
}

// ── AUTO-REFRESH ──────────────────────────────────────
loadAll();
setInterval(loadAll, CONFIG.REFRESH_MINUTES * 60 * 1000);
