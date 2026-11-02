(() => {
  const guide = globalThis.sportGuide;
  const root = document.querySelector('#allsvenskan-content');
  const q = new URLSearchParams(location.search);
  const home = q.get('home');
  const away = q.get('away');
  const date = q.get('date');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  const matches = {
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
  root.innerHTML = `
    <section class="allsvenskan-hero">
      <p class="eyebrow">ALLSVENSKAN · OMGÅNG 27</p>
      <h1>${esc(details.title)}</h1>
      <p class="match-meta">${esc(dateLabel)} · avspark <b>${esc(details.kickoff)}</b><br>${esc(details.venue)}</p>
      ${stale ? `<p class="uncertain">Detta är daterade matchfakta för ${esc(date)} och visas inte som dagens match.</p>` : '<p>Verifierad för dagens datum.</p>'}
    </section>
    <section class="allsvenskan-grid">
      <article class="allsvenskan-card"><p class="eyebrow dark">SÄNDNING</p><h2>${esc(event.time)} · ${esc(event.channel)}</h2><p>${esc(event.service)}</p><p>${link(event.broadcastUrl || event.sourceUrl, 'Öppna officiell programsida')}</p><p>Sändningen börjar före avspark. Avsparkstiden 19.00 är verifierad av Allsvenskan och berörda klubbar.</p></article>
      <article class="allsvenskan-card"><p class="eyebrow dark">MATCHFAKTA</p><h2>Officiella källor</h2><div class="source-list">${link(details.schedule,'Allsvenskans spelschema')}${link(details.table,'Allsvenskans tabell')}${link(details.map,`Arena och karta: ${details.venue}`)}</div></article>
      <article class="allsvenskan-card"><p class="eyebrow dark">SENASTE MÖTEN</p><h2>Verifierade resultat</h2>${details.latest.map(match => `<div class="meeting"><time>${esc(match.date)}</time>${link(match.url,match.result)}</div>`).join('')}<p>Historiska datum och resultat behålls oförändrade.</p></article>
      <article class="allsvenskan-card"><p class="eyebrow dark">SENASTE RESULTAT</p><h2>Lagkällor</h2><div class="source-list">${details.teamResults.map(([label,url]) => link(url,label)).join('')}</div><p>Aktuella lagresultat hämtas via klubbarnas egna sidor; inga ej verifierade tabellplaceringar återges här.</p></article>
    </section>`;
})();
