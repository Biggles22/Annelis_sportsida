(() => {
  const guide=globalThis.sportGuide;
  if(!guide)return;
  const league=location.pathname.includes('shl.html')?'SHL':'NHL';
  const root=document.querySelector(league==='SHL'?'#shl-content':'#nhl-content');
  if(!root)return;
  const q=new URLSearchParams(location.search);
  const a=q.get('a')||(league==='SHL'?'SKE':'FLA'),b=q.get('b')||(league==='SHL'?'IFB':'WPG');
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date());
  const e=guide.events.find(x=>x.league===league&&x.home===a&&x.away===b&&(!q.has('date')||q.get('date')===x.date));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link=(u,t)=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)} ↗</a>`;
  const label=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(d+'T12:00:00Z'));
  const heading=document.createElement('section');heading.className='verification-note match-context';root.before(heading);
  const data=league==='SHL'?Promise.resolve(globalThis.shlSnapshot):fetch('nhl-data.json',{cache:'no-cache'}).then(r=>r.json());
  data.then(d=>{
    const g=e?d.fixtures?.find(g=>league==='SHL'?g.home===a&&g.away===b:g.homeTeam.abbrev===a&&g.awayTeam.abbrev===b):null;
    const when=g?(league==='SHL'?g.time:new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(g.startTimeUTC))):null;
    const completed=g&&(league==='SHL'?Number.isInteger(g.hs):Number.isInteger(g.homeTeam.score));
    heading.innerHTML=`<p class="eyebrow dark">${e?.date===today?'DAGENS MATCH':'DATERADE MATCH- OCH LAGFAKTA'}</p><h2>${e?esc(label(e.date)):'Ingen verifierad sändning för det valda datumet'}</h2>${e?`<p>${e.status?'Sändningsstart och kanal är ej verifierade.':`Sändningsstart <b>${esc(e.time)}</b> · ${esc(e.channel)} · ${esc(e.service)}`}</p>`:''}${g?`<p>Matchstart ${esc(when)} svensk tid · ${esc(g.venue)}${completed?` · Slutresultat ${league==='SHL'?g.hs+'–'+g.as:g.homeTeam.score+'–'+g.awayTeam.score}`:''}</p>`:''}<p>${e?link(e.broadcastUrl||e.sourceUrl,'Officiell programkälla'):''} ${g&&league==='NHL'?link('https://www.nhl.com/gamecenter/'+g.id,'NHL:s matchfakta'):league==='SHL'?link('https://stats.swehockey.se/ScheduleAndResults/Overview/20961','Officiellt matchprogram och resultat'):''}</p><p>Senast kontrollerat ${esc(new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(d.updatedAt||d.checkedAt)))} svensk tid. Historiska resultat behåller källans matchdatum.</p>${guide.date!==today?'<p>Dagens innehåll är inte verifierat. Underlaget avser '+esc(guide.date)+'.</p>':''}`;
    const recent=document.createElement('section');recent.className='nhl-card verification-note';
    const list=code=>league==='SHL'?d.results.filter(g=>g.home===code||g.away===code).slice(0,3):(d.results[code]||[]);
    const result=g=>league==='SHL'?`${g.date} · ${g.home}–${g.away} ${g.hs}–${g.as}`:`${g.gameDate} · ${g.homeTeam.abbrev}–${g.awayTeam.abbrev} ${g.homeTeam.score}–${g.awayTeam.score}`;
    recent.innerHTML='<h2>Senaste verifierade resultat</h2>'+[a,b].map(code=>'<h3>'+esc(code)+'</h3>'+list(code).map(g=>'<p>'+link(league==='SHL'?g.sourceUrl:'https://www.nhl.com/gamecenter/'+g.id,result(g))+'</p>').join('')).join('');root.after(recent);
  }).catch(()=>{heading.textContent='Matchens datum och sändningsuppgifter kunde inte laddas. Kontrollera officiell programkälla.'});
})();
