document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="tablet.css"><link rel="stylesheet" href="verification.css">');
const root=document.querySelector('#tt-matches');
const verifiedDate='2026-11-01';
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date());
if(today!==verifiedDate){
  root.innerHTML='<p class="verification-note">Dagens program är inte verifierat. Senast verifierad sändning: 1 november 2026. Äldre matcher visas inte som dagens.</p>';
  document.querySelector('.tt-heading .eyebrow').textContent='SENAST VERIFIERAT';
}else{
  root.innerHTML=[
    '<article class="tt-match">',
    '<time datetime="2026-11-01T13:15:00+01:00">13:15</time>',
    '<div class="tt-player"><span>🇸🇪</span><div><b>Truls Möregårdh</b><small>Sverige · 3 set</small></div></div>',
    '<span class="tt-vs">3–4</span>',
    '<div class="tt-player right"><span>🇩🇪</span><div><b>Patrick Franziska</b><small>Tyskland · 4 set · vinnare</small></div></div>',
    '<button type="button" aria-expanded="false" aria-controls="tt-semifinal-info">Matchfakta +</button>',
    '<div class="tt-details" id="tt-semifinal-info"><p><b>WTT Champions Montpellier · semifinal, herrsingel</b><span>Patrick Franziska vann med 4–3 i set. Matchen spelades söndag 1 november 2026 från kl. 13.15 svensk tid i Sud de France Arena.</span></p><div><a href="https://www.svt.se/sport/bordtennis/truls-moregardh-ar-ute-ur-montpellier-wtt" target="_blank" rel="noreferrer">SVT:s matchrapport och resultat ↗</a><br><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">WTT:s tävlingscenter ↗</a></div></div>',
    '</article>',
    '<article class="tt-match">',
    '<time datetime="2026-11-01T17:30:00+01:00">17:30</time>',
    '<div class="tt-player"><span>🏓</span><div><b>Kuai Man–Sun Yingsha</b><small>Damfinal 17.30 · därefter Jang Woojin–Patrick Franziska</small></div></div>',
    '<span class="tt-vs">FINALPASS</span>',
    '<div class="tt-player right"><span>📺</span><div><b>SVT Play</b><small>17.30–20.00 svensk tid</small></div></div>',
    '<button type="button" aria-expanded="false" aria-controls="tt-finals-info">Matchfakta +</button>',
    '<div class="tt-details" id="tt-finals-info"><p><b>WTT Champions Montpellier · finaler</b><span>Damfinal: Kuai Man–Sun Yingsha kl. 17.30. Herrfinal: Jang Woojin–Patrick Franziska kl. 18.30. SVT Play sänder finalpasset 17.30–20.00. Slutresultaten var ännu inte verifierade i tillgänglig officiell källa vid senaste kontrollen.</span></p><div><a href="https://www.fftt.com/actualites/wtt/les-finales-sont-connues/" target="_blank" rel="noreferrer">FFTT:s officiella finalprogram ↗</a><br><a href="https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026" target="_blank" rel="noreferrer">SVT:s sportguide ↗</a><br><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">WTT:s tävlingscenter ↗</a></div></div>',
    '</article>',
    '<p class="verification-note">Semifinalresultatet och SVT Play-sändningarna kontrollerades mot SVT. Finalister och finaltider kontrollerades mot FFTT den 1 november 2026. Alla tider är svensk tid.</p>'
  ].join('');
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    const details=button.closest('.tt-match')?.querySelector('.tt-details');
    if(!details)return;
    const open=details.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
    button.textContent=open?'Stäng −':'Matchfakta +';
  });
}
