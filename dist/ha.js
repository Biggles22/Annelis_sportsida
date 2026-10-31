document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="tablet.css">');
const root = document.querySelector('#ha-content');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Stockholm'}).format(new Date());
const dateLabel = date => new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Stockholm',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(date + 'T12:00:00+01:00'));
const shortDate = date => new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Stockholm',day:'numeric',month:'short'}).format(new Date(date + 'T12:00:00+01:00')).replace(/\.$/, '');
const external = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
const matchUrl = game => `hockeyallsvenskan.html?a=${encodeURIComponent(game.home)}&b=${encodeURIComponent(game.away)}&date=${game.date}`;
let map;

function render(data) {
  const teams = data.teams, today = localDate();
  const q = new URLSearchParams(location.search);
  const todayGames = data.fixtures.filter(g => g.date === today);
  const first = todayGames[0];
  const a = q.has('a') ? q.get('a') : first?.home;
  const b = q.has('b') ? q.get('b') : first?.away;
  const ta = teams[a], tb = teams[b];
  const recent = [...data.results].sort((x,y) => y.date.localeCompare(x.date));
  const allGames = [...data.fixtures, ...recent];
  const game = allGames.find(g => g.home === a && g.away === b && (!q.has('date') || g.date === q.get('date')));
  const checked = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Stockholm',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(data.checkedAt));
  const stale = data.date !== today;
  const freshness = `<p class="ha-check ${stale?'ha-warning':''}">${stale?'Underlaget är inte verifierat för dagens datum. ':''}Kontrollerat ${esc(checked)} svensk tid. Tabell och resultat efter ${esc(shortDate(data.resultsThrough))}. Uppgifterna är en daterad ögonblicksbild.</p>`;
  const nav = `<nav class="ha-picker" aria-label="Välj match i Hockeyallsvenskan"><div><p class="eyebrow dark">${todayGames.length?'DAGENS MATCHER':'SENAST VERIFIERADE MATCHPROGRAM'}</p>${todayGames.length?todayGames.map(g => `<a ${g===game?'aria-current="page"':''} href="${matchUrl(g)}"><b>${esc(g.broadcastTime)}</b> ${esc(teams[g.home].name)} – ${esc(teams[g.away].name)}</a>`).join(''):`<p>Inga matcher är verifierade för ${esc(dateLabel(today))}. ${external(data.sources.schedule,'Kontrollera officiellt spelschema')}</p>`}</div><details><summary>Matchfakta från ${esc(shortDate(data.resultsThrough))}</summary><div class="ha-archive-links">${recent.filter(g=>g.date===data.resultsThrough).map(g=>`<a href="${matchUrl(g)}">${esc(teams[g.home].name)} – ${esc(teams[g.away].name)} · ${g.hs}–${g.as}</a>`).join('')}</div></details></nav>`;
  if (!ta || !tb || a === b) {
    root.innerHTML = `<section class="ha-card ha-error"><h1>${q.size?'Matchen hittades inte':'Hockeyallsvenskan'}</h1><p>Välj en verifierad match nedan.</p>${freshness}</section>${nav}`;
    return;
  }
  const venue = game?.venue || ta.arena;
  document.title = `${ta.name} – ${tb.name} · Hockeyallsvenskan`;
  const tableRow = code => { const t=teams[code]; return `<div class="ha-row"><span class="ha-mini">${esc(code)}</span><div><b>${esc(t.name)}</b><small>${t.gp} matcher · ${t.points} poäng</small></div><strong>#${t.pos}</strong></div>`; };
  const teamCard = (code,t,label) => `<div class="ha-team"><span class="ha-side">${label}</span><div class="ha-shield">${esc(code)}</div><h1>${esc(t.name)}</h1><p>${esc(t.city)}</p></div>`;
  const gameRow = g => `<div class="ha-result"><time datetime="${g.date}">${esc(shortDate(g.date))}</time><p>${esc(teams[g.home].name)} – ${esc(teams[g.away].name)}<b>${g.hs}–${g.as}</b></p><small>${esc(g.venue)}</small></div>`;
  const form = code => `<div class="ha-form"><h3>${esc(teams[code].name)}</h3>${recent.filter(g=>g.home===code||g.away===code).slice(0,2).map(gameRow).join('')}</div>`;
  const meetings = recent.filter(g => (g.home===a&&g.away===b)||(g.home===b&&g.away===a));
  const completed = game && Number.isInteger(game.hs);
  const matchTime = game ? `<p class="ha-date">${esc(dateLabel(game.date))} · ${esc(venue)} · ${esc(ta.city)}</p><p class="ha-kickoff">Matchstart <time datetime="${game.date}T${game.time}:00+01:00">${game.time}</time>${completed?` · Slutresultat <b>${game.hs}–${game.as}</b>`:''}</p>` : `<p class="ha-date">Lagjämförelse · Hemmaarena: ${esc(ta.arena)}</p><p class="ha-warning">Ingen verifierad matchtid för det valda lagparet${q.has('date')?' och datumet':''}. Välj en match i listan.</p>`;
  const broadcast = game?.broadcastTime ? `<p class="ha-broadcast">Sändningsstart <b>${game.broadcastTime}</b> · ${esc(game.channel)}<br><span>${esc(game.service)} · ingår i Telias Största sportpaket</span></p><div class="ha-actions">${external(game.broadcastUrl,'Se sändningen på TV4 Play')}${external(data.sources.schedule,'Officiella matchfakta')}</div>` : `<div class="ha-actions">${external(data.sources.schedule,'Officiella matchfakta')}</div>`;
  const status = completed?'SPELAD MATCH':game?.date===today?'DAGENS MATCH':game?'VERIFIERAD MATCH':'LAGFAKTA';
  const mapLink = (t,arena) => external(`https://www.openstreetmap.org/search?query=${encodeURIComponent(arena+', '+t.city+', Sverige')}`,'Sök arenan på kartan');
  root.innerHTML = `<section class="ha-hero"><p class="eyebrow">HOCKEYALLSVENSKAN · ${status}</p><div class="ha-match">${teamCard(a,ta,'HEMMALAG')}<div class="ha-vs">MOT</div>${teamCard(b,tb,'BORTALAG')}</div>${matchTime}${broadcast}${freshness}</section>${nav}<section class="ha-grid"><article class="ha-card"><p class="eyebrow dark">TABELL EFTER ${esc(shortDate(data.resultsThrough)).toLocaleUpperCase('sv-SE')}</p><h2>Ligaplacering</h2>${tableRow(a)}${tableRow(b)}${external(data.sources.standings,'Se hela officiella tabellen')}</article><article class="ha-card"><p class="eyebrow dark">INBÖRDES MÖTEN</p><h2>Senast verifierat</h2>${meetings.length?meetings.slice(0,3).map(gameRow).join(''):'<p>Inget inbördes möte är verifierat i det här underlaget.</p>'}<p class="verified">Avslutade matcher i det verifierade underlaget för säsongen 2026/27. Hemmalaget visas först.</p>${external(data.sources.schedule,'Fler resultat och inbördes möten')}</article><article class="ha-card ha-wide"><p class="eyebrow dark">SENASTE RESULTAT</p><h2>De två senaste matcherna</h2><div class="ha-forms">${form(a)}${form(b)}</div>${external(data.sources.results,'Officiella resultat')}<p class="verified">Resultaten omfattar matcherna till och med ${esc(shortDate(data.resultsThrough))}. Ingen liveuppdatering.</p></article></section><section class="sweden-section"><div><p class="eyebrow">ARENOR OCH HEMORTER</p><h2>Från ${esc(ta.city)}<br>till ${esc(tb.city)}</h2><p class="arena"><b>${esc(venue)}</b>${esc(ta.city)} · ${game?'matcharena':'hemmaarena'} ${mapLink(ta,venue)}</p><p class="arena"><b>${esc(tb.arena)}</b>${esc(tb.city)} · bortalagets hemmaarena ${mapLink(tb,tb.arena)}</p><p class="ha-map-note">Översiktskartan visar ungefärliga hemorter. Använd arenalänkarna för att hitta till ishallen.</p></div><div id="ha-map" class="ha-real-map"><p class="ha-map-fallback">Kartan kunde inte visas. Arenalänkarna fungerar även utan kartan.</p></div></section><section class="ha-sources"><h2>Källor och kontroll</h2><p>${external(data.sources.results,'Svenska Ishockeyförbundet: resultat och matchprogram')} · ${external(data.sources.standings,'Officiell tabell')} · ${external(data.sources.package,'Telias paketinnehåll')}</p><p>Matchstart kommer från Svenska Ishockeyförbundet. Sändningsstart kommer från TV4 Play och kan vara tidigare än matchstart.</p>${freshness}</section>`;
  if (typeof L !== 'undefined') initMap(a,b,ta,tb);
}

function initMap(a,b,ta,tb) {
  map = L.map('ha-map',{scrollWheelZoom:false});
  document.querySelector('.ha-map-fallback')?.remove();
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
  const icon = (color,code) => L.divIcon({className:'ha-map-icon',html:`<span style="--pin:${color}">${esc(code)}</span>`,iconSize:[50,50],iconAnchor:[25,25]});
  const m1 = L.marker(ta.cityCoordinates,{icon:icon('#ff5b35',a)}).addTo(map).bindPopup(`${esc(ta.name)}<br>${esc(ta.city)} · ungefärlig hemort`);
  const m2 = L.marker(tb.cityCoordinates,{icon:icon('#b9ffcf',b)}).addTo(map).bindPopup(`${esc(tb.name)}<br>${esc(tb.city)} · ungefärlig hemort`);
  L.polyline([ta.cityCoordinates,tb.cityCoordinates],{color:'#0d6b50',weight:3,dashArray:'9 10'}).addTo(map);
  map.fitBounds(L.latLngBounds([m1.getLatLng(),m2.getLatLng()]).pad(.45),{maxZoom:7});
  setTimeout(()=>map.invalidateSize(),80);
}

fetch('ha-data.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('data');return r.json();}).then(render).catch(()=>{
  root.innerHTML='<section class="ha-card ha-error"><h1>Matchfakta kunde inte laddas</h1><p>Försök igen eller öppna <a href="https://stats.swehockey.se/ScheduleAndResults/Overview/20962" target="_blank" rel="noopener">Svenska Ishockeyförbundets officiella resultat och matchprogram ↗</a>.</p></section>';
});
