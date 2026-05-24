
// ══════════════════════════════════════════════════════
//  QUINIELA MUNDIAL 2026 — APP v4
//  Quinielas con países, número de partido y colores
// ══════════════════════════════════════════════════════

const DEMO_MODE = CONFIG.SHEET_ID === 'TU_SHEET_ID_AQUI';

function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// ── JSONP fetch ───────────────────────────────────────
function fetchSheetJSONP(sheetName) {
  return new Promise((resolve, reject) => {
    const cbName = 'gviz_' + sheetName.replace(/\s/g,'_') + '_' + Date.now();
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&callback=${cbName}`;
    const timeout = setTimeout(() => {
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('Timeout: ' + sheetName));
    }, 10000);
    window[cbName] = function(json) {
      clearTimeout(timeout);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
      resolve(gvizToObjects(json));
    };
    const script = document.createElement('script');
    script.src = url;
    script.onerror = () => { clearTimeout(timeout); delete window[cbName]; reject(new Error('Error: ' + sheetName)); };
    document.head.appendChild(script);
  });
}

function gvizToObjects(json) {
  if (!json || !json.table) return [];
  const cols = json.table.cols.map(c => (c.label || c.id || '').trim());
  const types = json.table.cols.map(c => c.type || 'string');
  return (json.table.rows || []).map(row => {
    const obj = {};
    cols.forEach((col, i) => {
      if (!col) return;
      const cell = row.c ? row.c[i] : null;
      if (!cell || cell.v === null || cell.v === undefined) { obj[col] = ''; return; }
      // Use formatted value 'f' when available (shows dates as "11-jun", numbers as "1")
      if (cell.f !== undefined && cell.f !== null) {
        obj[col] = String(cell.f).trim();
      } else if (types[i] === 'number') {
        // Convert 1.0 -> "1"
        obj[col] = String(Math.round(parseFloat(cell.v)));
      } else {
        obj[col] = String(cell.v).trim();
      }
    });
    return obj;
  }).filter(obj => Object.values(obj).some(v => v !== ''));
}

// ── DEMO DATA ─────────────────────────────────────────
function getDemoData() {
  const partidos = [
    {partido:'1',grupo:'A',fecha:'11-Jun',local:'México',      visitante:'Sudáfrica',   sede:'Cd. de México',gol_l:'2',gol_v:'1'},
    {partido:'2',grupo:'A',fecha:'11-Jun',local:'Corea del Sur',visitante:'Rep. Checa', sede:'Guadalajara',  gol_l:'',gol_v:''},
    {partido:'3',grupo:'B',fecha:'12-Jun',local:'Canadá',      visitante:'Bosnia-Herz.',sede:'Toronto',      gol_l:'',gol_v:''},
    {partido:'4',grupo:'C',fecha:'13-Jun',local:'Brasil',      visitante:'Marruecos',   sede:'Nueva York/NJ',gol_l:'',gol_v:''},
  ];
  const participantes = [
    {nick:'El Pulpo',     pts:'12',exactos:'2',ganadores:'2',jugados:'4',p1_l:'2',p1_v:'1',p2_l:'1',p2_v:'0',p3_l:'2',p3_v:'2',p4_l:'1',p4_v:'0'},
    {nick:'La Pantera',   pts:'4', exactos:'0',ganadores:'2',jugados:'4',p1_l:'1',p1_v:'0',p2_l:'0',p2_v:'1',p3_l:'1',p3_v:'1',p4_l:'2',p4_v:'1'},
    {nick:'Toro',         pts:'7', exactos:'1',ganadores:'1',jugados:'4',p1_l:'2',p1_v:'1',p2_l:'2',p2_v:'0',p3_l:'0',p3_v:'1',p4_l:'1',p4_v:'1'},
  ];
  const noticias = [
    {fecha:'Jun 11 2026',titulo:'¡Arrancó el Mundial!',   cuerpo:'México venció 2-1 a Sudáfrica en el partido inaugural. ¡Gran inicio!'},
    {fecha:'Jun 07 2026',titulo:'Quinielas cerradas hoy', cuerpo:'Hoy es el límite a las 20:00 hrs. ¡Mucho ánimo!'},
  ];
  return { partidos, participantes, noticias };
}

// ── RENDER CLASIFICACIÓN ──────────────────────────────
function renderClasificacion(data) {
  const sorted = [...data].sort((a,b) => {
    const pa = parseInt(a.pts||0), pb = parseInt(b.pts||0);
    if (pb !== pa) return pb - pa;
    return parseInt(b.exactos||0) - parseInt(a.exactos||0);
  });
  const totalJugados = sorted.length ? parseInt(sorted[0].jugados||0) : 0;
  const leader = sorted[0];
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="val">${sorted.length}</div><div class="lbl">Participantes</div></div>
    <div class="stat-card"><div class="val">${totalJugados}</div><div class="lbl">Partidos Jugados</div></div>
    <div class="stat-card"><div class="val">${leader?leader.pts||0:0}</div><div class="lbl">Puntos Líder</div></div>
    <div class="stat-card"><div class="val">${72-totalJugados}</div><div class="lbl">Por Jugar</div></div>`;

  const medals = ['🥇','🥈','🥉'], classes = ['first','second','third'];
  document.getElementById('podium').innerHTML = [1,0,2].map(i => {
    const p = sorted[i]; if (!p) return '';
    return `<div class="podium-item ${classes[i]}">
      <span class="podium-medal">${medals[i]}</span>
      <div class="podium-name">${p.nick||'—'}</div>
      <div class="podium-pts">${p.pts||0}<span> pts</span></div>
    </div>`;
  }).join('');

  document.getElementById('ranking-body').innerHTML = sorted.map((p,i) => {
    const rank = i+1, bc = rank<=3?`rank-${rank}`:'rank-n';
    return `<tr class="${rank<=3?'top3':''}">
      <td><span class="rank-badge ${bc}">${rank}</span></td>
      <td>${p.nick||'—'}</td>
      <td class="pts-cell">${p.pts||0}</td>
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
  'Alemania':'🇩🇪','Curazao':'🇨🇼','C. de Marfil':'🇨🇮','Costa de Marfil':'🇨🇮','Ecuador':'🇪🇨',
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
    const g = p.grupo||'?';
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(p);
  });
  document.getElementById('matches-container').innerHTML = Object.entries(grupos).map(([grp, matches]) => `
    <div class="group-section">
      <div class="group-header">
        <span class="group-label">GRUPO ${grp}</span>
        <span class="group-title">${[...new Set(matches.flatMap(m=>[m.local,m.visitante]))].filter(Boolean).slice(0,4).join(' · ')}</span>
      </div>
      ${matches.map(m => {
        const gl = m.gol_l||'', gv = m.gol_v||'', played = gl!==''&&gv!=='';
        const num = m.partido||'';
        return `<div class="match-card ${played?'played':''}">
          <div class="team">
            <span class="team-flag">${getFlag(m.local||'')}</span>
            <span class="team-name">${m.local||''}</span>
          </div>
          <div class="score-box">
            ${played?`<div class="score-nums">${gl} – ${gv}</div>`:`<div class="score-pending">VS</div>`}
            <div class="score-date">${m.fecha||''} ${num?'· #'+num:''}</div>
            <div class="score-venue">${m.sede||''}</div>
          </div>
          <div class="team away">
            <span class="team-flag">${getFlag(m.visitante||'')}</span>
            <span class="team-name">${m.visitante||''}</span>
          </div>
        </div>`;
      }).join('')}
    </div>`).join('');
}

// ── RENDER QUINIELAS ──────────────────────────────────
// Formato hoja: nick | p1_l | p1_v | p2_l | p2_v | ... p72_l | p72_v
function renderQuinielas(participantes, partidos) {
  if (!participantes.length) {
    document.getElementById('quinielas-container').innerHTML =
      '<div class="error-msg">No hay quinielas cargadas aún.</div>'; return;
  }
  document.getElementById('quinielas-container').innerHTML = `
    <p style="color:var(--muted);font-size:0.85rem;margin-bottom:16px">
      Selecciona un participante para ver su quiniela completa con países y número de partido.
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">
      ${participantes.map((p,i) => `
        <button onclick="showQuiniela(${i})"
          style="padding:8px 16px;background:var(--card);border:1px solid var(--border);
                 border-radius:8px;color:var(--cream);font-family:'Rajdhani',sans-serif;
                 font-size:0.88rem;font-weight:600;cursor:pointer;transition:all .2s"
          onmouseover="this.style.borderColor='var(--gold)'"
          onmouseout="this.style.borderColor='var(--border)'">
          ${p.nick||'Participante '+(i+1)}
        </button>`).join('')}
    </div>
    <div id="quiniela-detail" style="color:var(--muted);font-size:0.85rem;text-align:center;padding:20px">
      Selecciona un participante ↑
    </div>`;
  window._qData = participantes;
  window._pData = partidos;
}

function showQuiniela(idx) {
  const p = window._qData[idx];
  const partidos = window._pData || [];
  const name = p.nick || 'Participante';

  // Calcular puntos por partido si hay resultados reales
  const rows = partidos.map((match, i) => {
    const num = match.partido || String(i+1);
    const pl = p[`p${num}_l`] !== undefined ? p[`p${num}_l`] : p[`p${i+1}_l`] || '';
    const pv = p[`p${num}_v`] !== undefined ? p[`p${num}_v`] : p[`p${i+1}_v`] || '';
    const rl = match.gol_l || '', rv = match.gol_v || '';
    const played = rl !== '' && rv !== '';
    const filled = pl !== '' && pv !== '';

    let pts = '', rowClass = '', badge = '';
    if (played && filled) {
      if (pl === rl && pv === rv) {
        pts = '5'; rowClass = 'style="background:rgba(72,187,120,0.08)"'; badge = '⭐⭐⭐';
      } else {
        const realWinner = parseInt(rl)>parseInt(rv)?'L':parseInt(rv)>parseInt(rl)?'V':'E';
        const pronWinner = parseInt(pl)>parseInt(pv)?'L':parseInt(pv)>parseInt(pl)?'V':'E';
        if (realWinner === pronWinner) {
          pts = '2'; rowClass = 'style="background:rgba(236,201,75,0.08)"'; badge = '⭐⭐';
        } else {
          pts = '0'; rowClass = 'style="background:rgba(245,101,101,0.06)"'; badge = '✗';
        }
      }
    }

    return `<tr ${rowClass}>
      <td style="color:var(--gold);font-weight:700;text-align:center">${num}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
          <span style="font-size:0.9rem">${getFlag(match.local||'')}</span>
          <span style="font-weight:600;color:var(--cream)">${match.local||''}</span>
        </div>
      </td>
      <td style="text-align:center;font-weight:700;font-size:1.1rem;color:${filled?'var(--gold-lt)':'var(--muted)'};font-family:'Cormorant Garamond',serif">
        ${filled?`${pl} – ${pv}`:'— –'}
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:0.9rem">${getFlag(match.visitante||'')}</span>
          <span style="font-weight:600;color:var(--cream)">${match.visitante||''}</span>
        </div>
      </td>
      <td style="text-align:center;font-size:0.85rem">${badge}</td>
      <td style="text-align:center;font-weight:700;color:var(--gold-lt)">${pts}</td>
    </tr>`;
  });

  document.getElementById('quiniela-detail').innerHTML = `
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:var(--gold-lt);margin-bottom:6px">
      ${name}
    </div>
    <div style="font-size:0.8rem;color:var(--muted);margin-bottom:20px;font-family:'Rajdhani',sans-serif;letter-spacing:0.06em">
      ${p.pts||0} PTS &nbsp;·&nbsp; ${p.exactos||0} EXACTOS &nbsp;·&nbsp; ${p.ganadores||0} GANADORES
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th style="text-align:right">LOCAL</th>
            <th style="width:90px">PRONÓSTICO</th>
            <th style="text-align:left">VISITANTE</th>
            <th style="width:50px"></th>
            <th style="width:40px">PTS</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>`;
}

// ── RENDER NOTICIAS ───────────────────────────────────
function renderNoticias(data) {
  document.getElementById('news-container').innerHTML = data.length
    ? data.map(n=>`
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
    renderQuinielas(demo.participantes, demo.partidos);
    renderNoticias(demo.noticias);
    document.getElementById('setup-guide').style.display = 'block';
    return;
  }
  document.getElementById('setup-guide').style.display = 'none';
  try {
    // Load sheets one by one — more reliable on Safari/mobile
    const partidos      = await fetchSheetJSONP(CONFIG.SHEETS.partidos);
    const participantes = await fetchSheetJSONP(CONFIG.SHEETS.participantes);
    const noticias      = await fetchSheetJSONP(CONFIG.SHEETS.noticias);

    window._partidosCache = partidos;
    renderClasificacion(participantes);
    renderPartidos(partidos);
    renderNoticias(noticias);

    // Quinielas optional — no bloquea si está vacía
    try {
      const quinielas = await fetchSheetJSONP(CONFIG.SHEETS.quinielas);
      renderQuinielas(quinielas, partidos);
    } catch(e) {
      renderQuinielas([], partidos);
    }

  } catch(err) {
    console.error('Error:', err);
    ['ranking-body','matches-container','news-container'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<div class="error-msg">Error: ${err.message}<br>Verifica que el Google Sheet sea público.</div>`;
    });
  }
}

loadAll();
setInterval(loadAll, CONFIG.REFRESH_MINUTES * 60 * 1000);
