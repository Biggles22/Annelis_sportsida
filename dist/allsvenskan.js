(() => {
  const guide = globalThis.sportGuide;
  const root = document.querySelector('#allsvenskan-content');
  const q = new URLSearchParams(location.search);
  const first = guide?.events?.find(e => e.league === 'Allsvenskan');
  const home = q.get('home') || first?.home;
  const away = q.get('away') || first?.away;
  const date = q.get('date') || first?.date;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  const matches = {
'2026-11-07:DEG-GAIS':{"title": "Degerfors IF – GAIS", "kickoff": "17:30", "venue": "Stora Valla, Degerfors", "round": 28, "schedule": "https://degerforsif.se/infor-gais-hemma-2/", "table": "https://allsvenskan.se/tabell", "map": "https://www.openstreetmap.org/search?query=Stora%20Valla%2C%20Degerfors", "latest": [], "teamResults": [["Officiell matchinformation", "https://degerforsif.se/infor-gais-hemma-2/"]]},
'2026-11-07:OIS-VSK':{"title": "Örgryte IS – Västerås SK", "kickoff": "17:30", "venue": "Gamla Ullevi, Göteborg", "round": 28, "schedule": "https://oisfotboll.se/2026/11/03/praktisk-info-ois-mot-vsk/", "table": "https://allsvenskan.se/tabell", "map": "https://www.openstreetmap.org/search?query=Gamla%20Ullevi%2C%20G%C3%B6teborg", "latest": [], "teamResults": [["Officiell matchinformation", "https://oisfotboll.se/2026/11/03/praktisk-info-ois-mot-vsk/"]]},
 '2026-11-06:HAM-ELF':{title:'Hammarby IF – IF Elfsborg',kickoff:'19:00',venue:'3Arena, Stockholm',round:28,
 schedule:'https://elfsborg.se/2026/11/03/supporterinfo-hammarby-if-borta-1/',table:'https://allsvenskan.se/tabell',
 map:'https://www.openstreetmap.org/search?query=3Arena%20Stockholm',latest:[],teamResults:[['Hammarby Fotboll','https://www.hammarbyfotboll.se/'],['IF Elfsborg: matchinfo','https://elfsborg.se/2026/11/03/supporterinfo-hammarby-if-borta-1/']]},
    '2026-11-03:SIR-HBK': {
      title:'IK Sirius – Halmstads BK',kickoff:'19:00',venue:'Studenternas IP, Uppsala',
      schedule:'https://www.hbk.se/nyheter/2026/november/matchguide-ik-sirius-hbk',table:'https://allsvenskan.se/tabell',
      map:'https://www.openstreetmap.org/search?query=Studenternas%20IP%20Uppsala',
      latest:[{date:'2026-08-03',result:'Halmstads BK – IK Sirius 0–2',url:'https://www.hbk.se/nyheter/2026/november/matchguide-ik-sirius-hbk'},{date:'2025-08-09',result:'Halmstads BK – IK Sirius 0–1',url:'https://www.hbk.se/nyheter/2026/november/matchguide-ik-sirius-hbk'},{date:'2025-04-27',result:'IK Sirius – Halmstads BK 1–1',url:'https://www.hbk.se/nyheter/2026/november/matchguide-ik-sirius-hbk'}],
      teamResults:[['HBK: matchguide och senaste resultat','https://www.hbk.se/nyheter/2026/november/matchguide-ik-sirius-hbk'],['IK Sirius','https://www.siriusfotboll.se/']]
    },
    '2026-11-02:GAIS-AIK': {
      title: 'GAIS – AIK', kickoff: '19:00', venue: 'Gamla Ullevi, Göteborg',
      schedule: 'https://allsvenskan.se/nyheter/sa-spelas-omgang-24-30-av-allsvenskan/',
      table: 'https://allsvenskan.se/tabell',
      map: 'https://www.openstreetmap.org/search?query=Gamla%20Ullevi%2C%20G%C3%B6teborg',
      latest: [
        {date:'2026-07-18', result:'AIK – GAIS 2–0', url:'https://www.gais.se/vara-lag/spelschema'},
        {date:'2026-03-14', result:'GAIS – AIK 3–2', url:'https://www.aikfotboll.se/matcher/260314-gais-aik-herr'}
      ],
      teamResults: [
        ['GAIS: spelschema och resultat','https://www.gais.se/vara-lag/spelschema'],
        ['AIK: spelschema och resultat','https://www.aikfotboll.se/matcher']
      ]
    },
    '2026-11-02:MAIF-KFF': {
      title: 'Mjällby AIF – Kalmar FF', kickoff: '19:00', venue: 'Strandvallen, Hällevik',
      schedule: 'https://allsvenskan.se/nyheter/sa-spelas-omgang-24-30-av-allsvenskan/',
      table: 'https://allsvenskan.se/tabell',
      map: 'https://www.openstreetmap.org/search?query=Strandvallen%2C%20H%C3%A4llevik',
      latest: [
        {date:'2026-07-25', result:'Kalmar FF – Mjällby AIF 2–1', url:'https://kalmarff.se/match/kalmar-ff-mjallby-aif-20260726/'},
        {date:'2026-02-21', result:'Mjällby AIF – Kalmar FF 2–0', url:'https://kalmarff.se/forlust-pa-strandvallen/'}
      ],
      teamResults: [
        ['Mjällby AIF: spelschema','https://maif.se/spelschema-a-lag/'],
        ['Kalmar FF: matcher och resultat','https://kalmarff.se/lag/a-laget/']
      ]
    }
  };
  const details = matches[`${date}:${home}-${away}`];
  const event = guide?.events?.find(item => item.league === 'Allsvenskan' && item.home === home && item.away === away && item.date === date);
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Stockholm'}).format(new Date());
  if (!guide || !details || !event) {
    root.innerHTML = '<section class="allsvenskan-card"><h1>Ingen verifierad match</h1><p>Den valda matchen finns inte i dagens verifierade sändningslista. Äldre matcher visas inte som dagens.</p><p><a href="index.html#guide">Till dagens lista</a></p></section>';
    return;
  }
  const dateLabel = new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${date}T12:00:00Z`));
  const stale = date !== today;
  const clubs = {
DEG:{name:'Degerfors IF',city:'Degerfors',arena:'Stora Valla',lat:59.235,lon:14.432},
OIS:{name:'Örgryte IS',city:'Göteborg',arena:'Gamla Ullevi',lat:57.7058,lon:11.9806},
VSK:{name:'Västerås SK',city:'Västerås',arena:'Hitachi Energy Arena',lat:59.63,lon:16.54},
 HAM:{name:'Hammarby IF',city:'Stockholm',arena:'3Arena',lat:59.2906,lon:18.0855},
 ELF:{name:'IF Elfsborg',city:'Borås',arena:'Borås Arena',lat:57.7342,lon:12.935},
    SIR:{name:'IK Sirius',city:'Uppsala',arena:'Studenternas IP',lat:59.8498,lon:17.6454,pos:1},
    HBK:{name:'Halmstads BK',city:'Halmstad',arena:'Örjans vall',lat:56.6833,lon:12.8586,pos:16},
    GAIS:{name:'GAIS',city:'Göteborg',arena:'Gamla Ullevi',lat:57.7058,lon:11.9806,pos:10,gp:26,points:34},
    AIK:{name:'AIK',city:'Solna',arena:'Strawberry Arena',lat:59.3725,lon:18.0007,pos:8,gp:26,points:38},
    MAIF:{name:'Mjällby AIF',city:'Hällevik',arena:'Strandvallen',lat:56.0175,lon:14.7168,pos:12,gp:26,points:26},
    KFF:{name:'Kalmar FF',city:'Kalmar',arena:'Guldfågeln Arena',lat:56.685,lon:16.3167,pos:13,gp:26,points:22}
  };
  if(date==='2026-11-07')for(const code of [home,away]){delete clubs[code].pos;delete clubs[code].gp;delete clubs[code].points;}
  const ta=clubs[home],tb=clubs[away];
  const club=(code,t,label)=>`<div class="club"><span class="club-label">${label}</span><div class="football-badge" aria-hidden="true">${esc(code)}</div><h1>${esc(t.name)}</h1><p>${esc(t.city)}</p></div>`;
  const standing=(code,t)=>`<div class="stand-row"><span class="football-mini">${esc(code)}</span><div><b>${esc(t.name)}</b><span>${t.gp ? t.gp+' matcher · '+t.points+' poäng' : t.pos?'Placering i daterad matchguide före matchen':'Förhandsplacering ej verifierad'}</span></div><strong>${t.pos ? '#'+t.pos : '–'}</strong></div>`;
  root.innerHTML = `
    <section class="match-hero">
      <p class="eyebrow">ALLSVENSKAN · MATCHFAKTA · OMGÅNG ${details.round||27}</p>
      <div class="matchup">${club(home,ta,'HEMMALAG')}<div class="versus"><span>MOT</span><i></i></div>${club(away,tb,'BORTALAG')}</div>
      <p class="venue-line"><span>MATCHARENA</span><b>${esc(details.venue)}</b></p>
      <p class="football-kickoff">${esc(dateLabel)} · Avspark <b>${esc(details.kickoff)}</b></p>
      <p class="football-broadcast">Sändningsstart <b>${esc(event.time)}</b> · ${esc(event.channel)} · ${esc(event.service)}</p>
      <div class="football-actions">${link(event.broadcastUrl || event.sourceUrl,'Se sändningen')}${link(details.schedule,'Officiellt spelschema')}</div>
      <p class="data-note">${stale ? `Daterade matchfakta för ${esc(date)}` : `Matchfakta för ${esc(dateLabel)}`} · Alla tider är svensk tid</p>
    </section>
    <section class="nhl-grid">
      <article class="nhl-card"><p class="eyebrow dark">TABELLUNDERLAG FÖRE MATCHEN</p><h2>Ligaplacering</h2>${standing(home,ta)}${standing(away,tb)}${link(details.table,'Se hela Allsvenskans tabell')}<p class="football-note">${date==='2026-11-07'?'Tabell före matchen ej verifierad. Ingen aktuell tabell visas.':'Daterad tabellbild, ingen liveuppdatering.'} ${link(details.schedule,'Daterad matchguide')}</p></article>
      <article class="nhl-card"><p class="eyebrow dark">SENASTE MÖTENA</p><h2>Inbördes matcher</h2>${details.latest.length?'':'<p>Äldre inbördes resultat är inte verifierade i detta underlag.</p>'}${details.latest.filter(match=>match.date<date).map(match=>`<div class="meeting-row"><time>${esc(match.date)}</time><p>${link(match.url,match.result)}</p></div>`).join('')}</article>
    </section>
    <section class="map-section"><div><p class="eyebrow">VAR LAGEN FINNS</p><h2>Två lag.<br>En fotbollsliga.</h2><div class="map-legend"><p><b>${esc(ta.city)}</b><span>${esc(ta.arena)}</span></p><p><b>${esc(tb.city)}</b><span>${esc(tb.arena)}</span></p></div><p>${link(details.map,'Hitta till matcharenan')}</p></div><div id="football-map" class="nhl-real-map"><p>Kartan kunde inte laddas. Använd länken till matcharenan.</p></div></section>
    <section class="football-sources"><p class="eyebrow dark">SENASTE RESULTAT OCH KÄLLOR</p><h2>Följ lagen</h2><div class="football-actions">${details.teamResults.map(([label,url])=>link(url,label)).join('')}${link(details.schedule,'Allsvenskans spelschema')}</div></section>`;
  if(typeof L !== 'undefined'){
    document.querySelector('#football-map').innerHTML='';
    const map=L.map('football-map',{scrollWheelZoom:false});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap'}).addTo(map);
    const marker=(t,code,color)=>L.marker([t.lat,t.lon],{icon:L.divIcon({className:'team-map-icon',html:`<span style="--pin:${color}">${esc(code)}</span>`,iconSize:[50,50],iconAnchor:[25,25]})}).addTo(map).bindPopup(`<b>${esc(t.name)}</b><br>${esc(t.arena)}<br>${esc(t.city)}`);
    const m1=marker(ta,home,'#ff5b35'),m2=marker(tb,away,'#b9ffcf');
    L.polyline([[ta.lat,ta.lon],[tb.lat,tb.lon]],{color:'#0d6b50',weight:3,dashArray:'9 10'}).addTo(map);
    map.fitBounds(L.latLngBounds([m1.getLatLng(),m2.getLatLng()]).pad(.35),{maxZoom:6});
    setTimeout(()=>map.invalidateSize(),80);
  }
})();
