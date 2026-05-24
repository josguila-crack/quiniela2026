// ══════════════════════════════════════════════════════
//  QUINIELA MUNDIAL 2026 — APP v5 FINAL
//  Método: script tag con intercepción de setResponse
// ══════════════════════════════════════════════════════

const DEMO_MODE = CONFIG.SHEET_ID === 'TU_SHEET_ID_AQUI';

// ── TAB NAVIGATION ────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// ── FETCH GOOGLE SHEET ────────────────────────────────
// Google siempre llama google.visualization.Query.setResponse({...})
// Interceptamos esa función globalmente antes de cargar el script
function fetchSheet(sheetName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const tid = setTimeout(() => {
      script.remove();
      reject(new Error('Timeout cargando: ' + sheetName));
    }, 15000);

    // Google llama esta función con los datos
    window.google = window.google || {};
    window.google.visualization = window.google.visualization || {};
    window.google.visualization.Query = window.google.visualization.Query || {};
    window.google.visualization.Query.setResponse = function(json) {
      clearTimeout(tid);
      script.remove();
      try { resolve(gvizToObjects(json)); }
      catch(e) { reject(e); }
    };

    const url = 'https://docs.google.com/spreadsheets/d/'
      + CONFIG.SHEET_ID
      + '/gviz/tq?tqx=out:json&sheet='
      + encodeURIComponent(sheetName);

    script.src = url;
    script.onerror = () => { clearTimeout(tid); script.remove(); reject(new Error('Error: ' + sheetName)); };
    document.head.appendChild(script);
  });
}

// ── PARSE GVIZ RESPONSE ───────────────────────────────
function gvizToObjects(json) {
  if (!json || !json.table) return [];
  const cols  = json.table.cols.map(c => (c.label || c.id || '').trim());
  const types = json.table.cols.map(c => c.type || 'string');
  return (json.table.rows || []).map(row => {
    const obj = {};
    cols.forEach((col, i) => {
      if (!col) return;
      const cell = row.c ? row.c[i] : null;
      if (!cell || cell.v === null || cell.v === undefined) { obj[col] = ''; return; }
      // Usar valor formateado cuando existe (fechas, números)
      if (cell.f !== undefined && cell.f !== null) {
        obj[col] = String(cell.f).trim();
      } else if (types[i] === 'number') {
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
  return {
    partidos: [
      {partido:'1',grupo:'A',fecha:'11-Jun',local:'México',        visitante:'Sudáfrica',   sede:'Cd. de México', gol_l:'2', gol_v:'1'},
      {partido:'2',grupo:'A',fecha:'11-Jun',local:'Corea del Sur', visitante:'Rep. Checa',  sede:'Guadalajara',   gol_l:'',  gol_v:''},
      {partido:'3',grupo:'B',fecha:'12-Jun',local:'Canadá',        visitante:'Bosnia-Herz.',sede:'Toronto',       gol_l:'',  gol_v:''},
      {partido:'4',grupo:'C',fecha:'13-Jun',local:'Brasil',        visitante:'Marruecos',   sede:'Nueva York/NJ', gol_l:'',  gol_v:''},
    ],
    participantes: [
      {nick:'El Pulpo',   pts:'7', exactos:'1',ganadores:'2',jugados:'4'},
      {nick:'La Pantera', pts:'4', exactos:'0',ganadores:'2',jugados:'4'},
      {nick:'Toro',       pts:'5', exactos:'1',ganadores:'0',jugados:'4'},
    ],
    quinielas: [
      {nick:'El Pulpo',   p1_l:'2',p1_v:'1',p2_l:'1',p2_v:'0',p3_l:'2',p3_v:'0',p4_l:'0',p4_v:'1'},
      {nick:'La Pantera', p1_l:'1',p1_v:'0',p2_l:'0',p2_v:'2',p3_l:'1',p3_v:'1',p4_l:'2',p4_v:'1'},
      {nick:'Toro',       p1_l:'2',p1_v:'1',p2_l:'2',p2_v:'1',p3_l:'0',p3_v:'1',p4_l:'1',p4_v:'0'},
    ],
    noticias: [
      {fecha:'Jun 11 2026', titulo:'¡Arrancó el Mundial!',   cuerpo:'México venció 2-1 a Sudáfrica. ¡Gran inicio!'},
      {fecha:'Jun 07 2026', titulo:'Quinielas cerradas',     cuerpo:'Límite hoy a las 20:00 hrs. ¡Mucho ánimo!'},
    ],
  };
}

// ── RENDER CLASIFICACIÓN ──────────────────────────────
function renderClasificacion(data) {
  const sorted = [...data].sort((a,b) => {
    const pa = parseInt(a.pts||0), pb = parseInt(b.pts||0);
    if (pb !== pa) return pb - pa;
    return parseInt(b.exactos||0) - parseInt(a.exactos||0);
  });
  const jugados = sorted.length ? parseInt(sorted[0].jugados||0) : 0;
  const leader  = sorted[0];

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="val">${sorted.length}</div><div class="lbl">Participantes</div></div>
    <div class="stat-card"><div class="val">${jugados}</div><div class="lbl">Partidos Jugados</div></div>
    <div class="stat-card"><div class="val">${leader ? leader.pts||0 : 0}</div><div class="lbl">Puntos Líder</div></div>
    <div class="stat-card"><div class="val">${72 - jugados}</div><div class="lbl">Por Jugar</div></div>`;

  const medals = ['🥇','🥈','🥉'], cls = ['first','second','third'];
  document.getElementById('podium').innerHTML = [1,0,2].map(i => {
    const p = sorted[i]; if (!p) return '';
    return `<div class="podium-item ${cls[i]}">
      <span class="podium-medal">${medals[i]}</span>
      <div class="podium-name">${p.nick||'—'}</div>
      <div class="podium-pts">${p.pts||0}<span> pts</span></div>
    </div>`;
  }).join('');

  document.getElementById('ranking-body').innerHTML = sorted.map((p,i) => {
    const r = i+1, bc = r<=3 ? `rank-${r}` : 'rank-n';
    return `<tr class="${r<=3?'top3':''}">
      <td><span class="rank-badge ${bc}">${r}</span></td>
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
  data.forEach(p => { const g = p.grupo||'?'; if(!grupos[g]) grupos[g]=[]; grupos[g].push(p); });
  document.getElementById('matches-container').innerHTML = Object.entries(grupos).map(([grp, ms]) => `
    <div class="group-section">
      <div class="group-header">
        <span class="group-label">GRUPO ${grp}</span>
        <span class="group-title">${[...new Set(ms.flatMap(m=>[m.local,m.visitante]))].filter(Boolean).slice(0,4).join(' · ')}</span>
      </div>
      ${ms.map(m => {
        const gl = (m.gol_l||'').trim(), gv = (m.gol_v||'').trim();
        const played = gl !== '' && gv !== '' && gl !== ' ' && gv !== ' ';
        return `<div class="match-card ${played?'played':''}">
          <div class="team">
            <span class="team-flag">${getFlag(m.local||'')}</span>
            <span class="team-name">${m.local||''}</span>
          </div>
          <div class="score-box">
            ${played ? `<div class="score-nums">${gl} – ${gv}</div>` : `<div class="score-pending">VS</div>`}
            <div class="score-date">${m.fecha||''} ${m.partido ? '· #'+m.partido : ''}</div>
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
function renderQuinielas(quinielas, partidos) {
  if (!quinielas.length) {
    document.getElementById('quinielas-container').innerHTML =
      '<div class="error-msg">No hay quinielas cargadas aún.</div>'; return;
  }
  document.getElementById('quinielas-container').innerHTML = `
    <p style="color:var(--muted);font-size:0.85rem;margin-bottom:16px">
      Selecciona un participante para ver su quiniela completa.
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px" id="q-buttons">
      ${quinielas.map((p,i) => `
        <button id="qbtn-${i}" onclick="showQuiniela(${i})"
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
  window._qData = quinielas;
  window._pData = partidos;
}

function calcPuntos(pl, pv, rl, rv) {
  if (pl==='' || pv==='' || rl==='' || rv==='') return null;
  const pli=parseInt(pl), pvi=parseInt(pv), rli=parseInt(rl), rvi=parseInt(rv);
  if (isNaN(pli)||isNaN(pvi)||isNaN(rli)||isNaN(rvi)) return null;
  if (pli===rli && pvi===rvi) return 5;
  const rw = rli>rvi?'L':rvi>rli?'V':'E';
  const pw = pli>pvi?'L':pvi>pli?'V':'E';
  return rw===pw ? 2 : 0;
}

function showQuiniela(idx) {
  document.querySelectorAll('[id^=qbtn-]').forEach(b => b.style.borderColor = 'var(--border)');
  document.getElementById('qbtn-'+idx).style.borderColor = 'var(--gold)';

  const p = window._qData[idx];
  const partidos = window._pData || [];
  const name = p.nick || 'Participante';
  let totalPts = 0;

  const rows = partidos.map((m, i) => {
    const num = (m.partido || String(i+1)).trim();
    const pl  = (p['p'+num+'_l'] ?? p['p'+(i+1)+'_l'] ?? '').trim();
    const pv  = (p['p'+num+'_v'] ?? p['p'+(i+1)+'_v'] ?? '').trim();
    const rl  = (m.gol_l||'').trim(), rv = (m.gol_v||'').trim();
    const played = rl!=='' && rv!=='' && rl!==' ' && rv!==' ';
    const filled = pl!=='' && pv!=='';
    const pts = played && filled ? calcPuntos(pl,pv,rl,rv) : null;
    if (pts !== null) totalPts += pts;

    let bg = '', badge = '';
    if (pts===5)      { bg='rgba(72,187,120,0.1)';  badge='⭐⭐⭐'; }
    else if (pts===2) { bg='rgba(236,201,75,0.1)';  badge='⭐⭐'; }
    else if (pts===0) { bg='rgba(245,101,101,0.07)';badge='✗'; }

    return `<tr style="${bg?'background:'+bg:''}">
      <td style="color:var(--gold);font-weight:700;text-align:center;font-size:0.85rem">${num}</td>
      <td>
        <div style="display:flex;align-items:center;gap:5px;justify-content:flex-end">
          <span>${getFlag(m.local||'')}</span>
          <span style="font-weight:600;color:var(--cream);font-size:0.85rem">${m.local||''}</span>
        </div>
      </td>
      <td style="text-align:center;font-weight:700;font-size:1.05rem;
                 color:${filled?'var(--gold-lt)':'var(--muted)'};font-family:'Cormorant Garamond',serif">
        ${filled ? pl+' – '+pv : '—'}
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:5px">
          <span>${getFlag(m.visitante||'')}</span>
          <span style="font-weight:600;color:var(--cream);font-size:0.85rem">${m.visitante||''}</span>
        </div>
      </td>
      <td style="text-align:center">${badge}</td>
      <td style="text-align:center;font-weight:700;color:var(--gold-lt)">${pts!==null?pts:''}</td>
    </tr>`;
  });

  document.getElementById('quiniela-detail').innerHTML = `
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:var(--gold-lt);margin-bottom:4px">${name}</div>
    <div style="font-size:0.8rem;color:var(--muted);margin-bottom:18px;font-family:'Rajdhani',sans-serif;letter-spacing:0.06em">
      ${p.pts||totalPts} PTS &nbsp;·&nbsp; ${p.exactos||0} EXACTOS &nbsp;·&nbsp; ${p.ganadores||0} GANADORES
    </div>
    <div class="tbl-wrap"><table>
      <thead><tr>
        <th style="width:36px">#</th>
        <th style="text-align:right">LOCAL</th>
        <th style="width:80px">PRONÓSTICO</th>
        <th style="text-align:left">VISITANTE</th>
        <th style="width:44px"></th>
        <th style="width:36px">PTS</th>
      </tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table></div>`;
}

// ── RENDER NOTICIAS ───────────────────────────────────
function renderNoticias(data) {
  document.getElementById('news-container').innerHTML = data.length
    ? data.map(n=>`
        <div class="news-card">
          <div class="news-date">${n.fecha||''}</div>
          <div class="news-title">${n.titulo||'Noticia'}</div>
          <div class="news-body">${n.cuerpo||n.mensaje||''}</div>
        </div>`).join('')
    : '<div class="error-msg">No hay noticias publicadas aún.</div>';
}

// ── CARGA SECUENCIAL ──────────────────────────────────
async function loadAll() {
  if (DEMO_MODE) {
    const d = getDemoData();
    renderClasificacion(d.participantes);
    renderPartidos(d.partidos);
    renderQuinielas(d.quinielas, d.partidos);
    renderNoticias(d.noticias);
    document.getElementById('setup-guide').style.display = 'block';
    return;
  }
  document.getElementById('setup-guide').style.display = 'none';

  try {
    const partidos = await fetchSheet(CONFIG.SHEETS.partidos);
    renderPartidos(partidos);
    window._partidosCache = partidos;
  } catch(e) {
    document.getElementById('matches-container').innerHTML =
      `<div class="error-msg">Error cargando partidos: ${e.message}</div>`;
  }

  try {
    const participantes = await fetchSheet(CONFIG.SHEETS.participantes);
    renderClasificacion(participantes);
  } catch(e) {
    document.getElementById('ranking-body').innerHTML =
      `<tr><td colspan="6"><div class="error-msg">Error cargando participantes: ${e.message}</div></td></tr>`;
  }

  try {
    const noticias = await fetchSheet(CONFIG.SHEETS.noticias);
    renderNoticias(noticias);
  } catch(e) {
    document.getElementById('news-container').innerHTML =
      `<div class="error-msg">Error cargando noticias: ${e.message}</div>`;
  }

  try {
    const quinielas = await fetchSheet(CONFIG.SHEETS.quinielas);
    renderQuinielas(quinielas, window._partidosCache || []);
  } catch(e) {
    renderQuinielas([], window._partidosCache || []);
  }
}

loadAll();
setInterval(loadAll, CONFIG.REFRESH_MINUTES * 60 * 1000);
