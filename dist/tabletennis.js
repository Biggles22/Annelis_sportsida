document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="tablet.css"><link rel="stylesheet" href="verification.css">');
const root=document.querySelector('#tt-matches');
const verifiedDate='2026-10-31';
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date());
if(today!==verifiedDate){
  root.innerHTML='<p class="verification-note">Dagens program är inte verifierat. Senast verifierad sändning: 31 oktober 2026. Äldre matcher visas inte som dagens.</p>';
  document.querySelector('.tt-heading .eyebrow').textContent='SENAST VERIFIERAT';
}else{
  root.innerHTML='<article class="tt-match"><time datetime="2026-10-31T18:40:00+01:00">18:40</time><div class="tt-player"><span>🇸🇪</span><div><b>Truls Möregårdh</b><small>Sverige</small></div></div><strong class="tt-vs">MOT</strong><div class="tt-player right"><div><b>Motståndare ej slutligt verifierad</b><small>Motstridiga uppgifter hos SVT</small></div></div><button type="button">Matchfakta +</button><div class="tt-details"><p><b>WTT Champions Montpellier · 31 oktober 2026</b><span>Sändningsstart 18.40 svensk tid på SVT Play. SVT:s sportguide anger Lin Shidong, medan programbeskrivningen på SVT Play anger Shunsuke Togami. Motståndaren kan därför inte publiceras som säker.</span></p><div><a href="https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026" target="_blank" rel="noreferrer">SVT:s sportguide ↗</a><br><a href="https://www.svtplay.se/bordtennis-wtt" target="_blank" rel="noreferrer">SVT Play: programbeskrivning ↗</a><br><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">WTT:s tävlingscenter ↗</a></div></div></article><p class="verification-note">Sändningsdatum, starttid och tjänst kontrollerade 31 oktober 2026. Motståndaruppgiften är osäker.</p>';
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const open=root.querySelector('.tt-details').classList.toggle('open');b.textContent=open?'Stäng −':'Matchfakta +'});
}
