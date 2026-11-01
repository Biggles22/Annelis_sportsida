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
    '<div class="tt-player"><span>🇸🇪</span><div><b>Truls Möregårdh</b><small>Sverige · herrsingel, semifinal</small></div></div>',
    '<span class="tt-vs">MOT</span>',
    '<div class="tt-player right"><span>🇩🇪</span><div><b>Patrick Franziska</b><small>Tyskland · semifinal</small></div></div>',
    '<button type="button" aria-expanded="false" aria-controls="tt-semifinal-info">Matchfakta +</button>',
    '<div class="tt-details" id="tt-semifinal-info"><p><b>WTT Champions Montpellier · semifinal, herrsingel</b><span>Söndag 1 november 2026 kl. 13.15 svensk tid, Sud de France Arena. SVT Play sänder semifinalen. Matchstart kan förskjutas om föregående matcher drar ut på tiden.</span></p><div><a href="https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026" target="_blank" rel="noreferrer">SVT:s bekräftade sändning ↗</a><br><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">WTT:s tävlingscenter ↗</a></div></div>',
    '</article>',
    '<article class="tt-match">',
    '<time datetime="2026-11-01T17:30:00+01:00">17:30</time>',
    '<div class="tt-player"><span>🏓</span><div><b>Finaler, damer och herrar</b><small>Finalisterna avgörs under dagen</small></div></div>',
    '<span class="tt-vs">FINALPASS</span>',
    '<div class="tt-player right"><span>📺</span><div><b>SVT Play</b><small>17.30–20.00 svensk tid</small></div></div>',
    '<button type="button" aria-expanded="false" aria-controls="tt-finals-info">Matchfakta +</button>',
    '<div class="tt-details" id="tt-finals-info"><p><b>WTT Champions Montpellier · finaler</b><span>SVT Play sänder dam- och herrfinalerna mellan 17.30 och 20.00. Finalisterna läggs till när de är officiellt fastställda.</span></p><div><a href="https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026" target="_blank" rel="noreferrer">SVT:s sportguide ↗</a><br><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">WTT:s tävlingscenter ↗</a></div></div>',
    '</article>',
    '<p class="verification-note">Båda SVT Play-sändningarna och Truls motståndare kontrollerade mot SVT den 1 november 2026. Alla tider är svensk tid.</p>'
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
