// ══════════════════════════════════════════════════════
//  QUINIELA MUNDIAL 2026 — APP v2
//  Lee cada hoja por GID usando el método gviz/tq
// ══════════════════════════════════════════════════════

const DEMO_MODE = CONFIG.SHEET_ID === 'TU_SHEET_ID_AQUI';

// ── TAB NAVIGATION ────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// ── FETCH POR NOMBRE DE HOJA (método gviz, no requiere CSV publicado) ──
async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo cargar: ' + sheetName);
  const text = await res.text();
  // Google devuelve: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1]);
  return gvizToObjects(json);
}

function gvizToObjects(json) {
  const cols = json.table.cols.map(c => c.label || c.id);
  const rows = json.table.rows || [];
  return rows.map(row => {
    const obj = {};
    cols.forEach((col, i) => {
      const cell = row.c[i];
      obj[col] = cell ? (cell.v !== null && cell.v !== undefined ? String(cell.v) : '') : '';
    });
    return obj;
  }).filter(obj => Object.values(obj).some(v => v !== ''));
}

// ── DEMO DATA ─────────────────────────────────────────
function getDemoData() {
  return {
    participantes: [
      {nick:'El Pulpo',      pts:'38', exactos:'5', ganadores:'9', jugados:'14'},
      {nick:'La Pantera',    pts:'32', exactos:'4', ganadores:'8', jugados:'14'},
      {nick:'Toro',          pts:'28', exactos:'3', ganadores:'7', jugados:'14'},
      {nick:'Reina del Sur', pts:'26', exactos:'2', ganadores:'9', jugados:'14'},
      {nick:'El Profe',      pts:'24', exactos:'3', ganadores:'6', jugados:'14'},
      {nick:'Lobo Gris',     pts:'22', exactos:'2', ganadores:'7', jugados:'14'},
    ],
    partidos: [
      {grupo:'A',fecha:'11-Jun',local:'México',      visitante:'Sudáfrica',   sede:'Ciudad de México', gol_l:'2',gol_v:'1'},
      {grupo:'A',fecha:'11-Jun',local:'Corea del Sur',visitante:'Rep. Checa', sede:'Guadalajara',       gol_l:'', gol_v:''},
      {grupo:'B',fecha:'12-Jun',local:'Canadá',      visitante:'Bosnia-Herz.',sede:'Toronto',           gol_l:'', gol_v:''},
      {grupo:'C',fecha:'13-Jun',local:'Brasil',      visitante:'Marruecos',   sede:'Nueva York/NJ',     gol_l:'', gol_v:''},
    ],
    noticias: [
      {fecha:'Jun 11 2026', titulo:'¡Arrancó el Mundial!',    cuerpo:'México venció 2-1 a Sudáfrica en el partido inaugural. ¡Gran inicio!'},
      {fecha:'Jun 07 2026', titulo:'Quinielas cerradas hoy',  cuerpo:'Hoy es el límite. Hasta las 20:00 hrs. ¡Mucho ánimo!'},
    ],
  };
}

// ── RENDER CLASIFICACIÓN ──────────────────────────────
function renderClasificacion(data) {
  const sorted = [...data].sort((a,b) => {
    const pa = parseInt(a.pts||a.puntos||0), pb = parseInt(b.pts||b.puntos||0);
    if (pb !== pa) return pb - pa;
    return parseInt(b.exactos||0) - parseInt(a.exactos||0);
  });

  const totalJugados = sorted.length > 0 ? parseInt(sorted[0].jugados||0) : 0;
  const leader = sorted[0];

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="val">${sorted.length}</div><div class="lbl">Participantes</div></div>
    <div class="stat-card"><div class="val">${totalJugados}</div><div class="lbl">Partidos Jugados</div></div>
    <div class="stat-card"><div class="val">${leader ? leader.pts||leader.puntos||0 : 0}</div><div class="lbl">Puntos Líder</div></div>
    <div class="stat-card"><div class="val">${72 - totalJugados}</div><div class="lbl">Por Jugar</div></div>
  `;

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

  document.getElementById('ranking-body').innerHTML = sorted.map((p, i) => {
    const rank = i + 1;
    const badgeClass = rank <= 3 ? `rank-${rank}` : 'rank-n';
    return `<tr class="${rank<=3?'top3':''}">
      <td><span class="rank-badge ${badgeClass}">${rank}</span></td>
      <td>${p.nick||p.nickname||p.nombre||'—'}</td>
      <td class="pts-cell">${p.pts||p.puntos||0}</td>
      <td class="exact-cell">${p.exactos||0}</td>
      <td>${p.ganadores||0}</td>
      <td>${p.jugados||0}</td>
    </tr>`;
  }).join('');
}

// ── RENDER PARTIDOS ───────────────────────────────────
const FLAGS = {
  'México':'🇲🇽','Sudáfrica':'🇿🇦','Corea del Sur':'🇰🇷','Rep. Checa':'🇨🇿',
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
const getFlag = n => FLAGS[n] || '🏳️';

function renderPartidos(data) {
  const grupos = {};
  data.forEach(p => {
    const g = p.grupo||p.grp||p.GRUPO||'?';
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(p);
  });

  document.getElementById('matches-container').innerHTML = Object.entries(grupos).map(([grp, matches]) => `
    <div class="group-section">
      <div class="group-header">
        <span class="group-label">GRUPO ${grp}</span>
        <span class="group-title">${[...new Set(matches.flatMap(m=>[m.local||m.LOCAL,m.visitante||m.VISITANTE]))].slice(0,4).join(' · ')}</span>
      </div>
      ${matches.map(m => {
        const gl = m.gol_l||m.GOL_L||'', gv = m.gol_v||m.GOL_V||'';
        const played = gl !== '' && gv !== '';
        return `<div class="match-card ${played?'played':''}">
          <div class="team">
            <span class="team-flag">${getFlag(m.local||m.LOCAL||'')}</span>
            <span class="team-name">${m.local||m.LOCAL||''}</span>
          </div>
          <div class="score-box">
            ${played ? `<div class="score-nums">${gl} – ${gv}</div>`
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
    </div>`).join('');
}

// ── RENDER QUINIELAS ──────────────────────────────────
function renderQuinielas(participantes) {
  document.getElementById('quinielas-container').innerHTML = `
    <p style="color:var(--muted);font-size:0.85rem;margin-bottom:20px">
      Selecciona un participante para ver su quiniela completa.
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px">
      ${participantes.map((p,i) => `
        <button onclick="showQuiniela(${i})"
          style="padding:8px 16px;background:var(--card);border:1px solid var(--border);
                 border-radius:8px;color:var(--cream);font-family:'Rajdhani',sans-serif;
                 font-size:0.88rem;font-weight:600;cursor:pointer;transition:all .2s"
          onmouseover="this.style.borderColor='var(--gold)'"
          onmouseout="this.style.borderColor='var(--border)'">
          ${p.nick||p.nickname||p.nombre||'Participante '+(i+1)}
        </button>`).join('')}
    </div>
    <div id="quiniela-detail" style="color:var(--muted);font-size:0.85rem;text-align:center;padding:20px">
      Selecciona un participante ↑
    </div>`;
  window._qData = participantes;
}

function showQuiniela(idx) {
  const p = window._qData[idx];
  const name = p.nick||p.nickname||p.nombre||'Participante';
  const skip = ['nick','nickname','nombre','pts','puntos','exactos','ganadores','jugados'];
  const pronos = Object.entries(p).filter(([k]) => !skip.includes(k.toLowerCase()));
  document.getElementById('quiniela-detail').innerHTML = `
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--gold-lt);margin-bottom:16px">
      Quiniela de ${name}
    </div>
    ${pronos.length ? `
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>PARTIDO</th><th>PRONÓSTICO</th></tr></thead>
        <tbody>${pronos.map(([k,v])=>`<tr><td>${k}</td><td style="color:var(--gold-lt);font-weight:600">${v||'—'}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : '<p style="color:var(--muted)">Sin pronósticos registrados aún.</p>'}`;
}

// ── RENDER NOTICIAS ───────────────────────────────────
function renderNoticias(data) {
  document.getElementById('news-container').innerHTML = data.length
    ? data.map(n => `
        <div class="news-card">
          <div class="news-date">${n.fecha||n.FECHA||''}</div>
          <div class="news-title">${n.titulo||n.TITULO||'Noticia'}</div>
          <div class="news-body">${n.cuerpo||n.CUERPO||n.mensaje||''}</div>
        </div>`).join('')
    : '<div class="error-msg">No hay noticias publicadas aún.</div>';
}

// ── MAIN LOAD ─────────────────────────────────────────
async function loadAll() {
  if (DEMO_MODE) {
    const demo = getDemoData();
    renderClasificacion(demo.participantes);
    renderPartidos(demo.partidos);
    renderQuinielas(demo.participantes);
    renderNoticias(demo.noticias);
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
    console.error('Error cargando datos:', err);
    // Mostrar error solo en las secciones que fallaron
    ['ranking-body','matches-container','quinielas-container','news-container'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.innerHTML.includes('Cargando')) {
        el.innerHTML = `<div class="error-msg">
          Error cargando datos.<br>
          Asegúrate que el Google Sheet es <b>público</b> (cualquiera con el link puede ver).<br>
          <small style="color:var(--muted)">${err.message}</small>
        </div>`;
      }
    });
  }
}

loadAll();
setInterval(loadAll, CONFIG.REFRESH_MINUTES * 60 * 1000);
