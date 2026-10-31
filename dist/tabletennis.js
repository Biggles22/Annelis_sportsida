document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="tablet.css"><link rel="stylesheet" href="verification.css">');
const root=document.querySelector('#tt-matches');
const verifiedDate='2026-11-01';
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date());
if(today!==verifiedDate){
  root.innerHTML='<p class="verification-note">Dagens program är inte verifierat. Senast verifierad sändning: 1 november 2026. Äldre matcher visas inte som dagens.</p>';
  document.querySelector('.tt-heading .eyebrow').textContent='SENAST VERIFIERAT';
}else{
  root.innerHTML='<article class="tt-match"><time datetime="2026-11-01T17:30:00+01:00">17:30</time><div class="tt-player"><span>🏓</span><div><b>Finaler, damer och herrar</b><small>Deltagare fastställs efter semifinalerna</small></div></div><button type="button">Matchfakta +</button><div class="tt-details"><p><b>WTT Champions Montpellier · 1 november 2026</b><span>SVT Play sänder dam- och herrfinalerna från 17.30 till 20.00 svensk tid. Inga spelarnamn visas innan finalisterna är officiellt fastställda.</span></p><div><a href="https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026" target="_blank" rel="noreferrer">SVT:s sportguide ↗</a><br><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">WTT:s tävlingscenter ↗</a></div></div></article><p class="verification-note">Sändningsdatum, starttid och tjänst kontrollerade mot SVT den 1 november 2026. Finalister läggs inte till förrän de kan verifieras officiellt.</p>';
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const open=root.querySelector('.tt-details').classList.toggle('open');b.textContent=open?'Stäng −':'Matchfakta +'});
}
