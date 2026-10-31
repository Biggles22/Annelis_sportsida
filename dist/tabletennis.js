document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="tablet.css"><link rel="stylesheet" href="verification.css">');
const root=document.querySelector('#tt-matches');
const verifiedDate='2026-10-31';
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date());
if(today!==verifiedDate){
  root.innerHTML='<p class="verification-note">Dagens program är inte verifierat. Senast verifierad sändning: 31 oktober 2026. Äldre matcher visas inte som dagens.</p>';
  document.querySelector('.tt-heading .eyebrow').textContent='SENAST VERIFIERAT';
}else{
  root.innerHTML='<article class="tt-match"><time datetime="2026-10-31T18:40:00+01:00">18:40</time><div class="tt-player"><span>🇸🇪</span><div><b>Truls Möregårdh</b><small>Sverige</small></div></div><strong class="tt-vs">MOT</strong><div class="tt-player right"><div><b>Lin Shidong</b><small>Kina</small></div></div><button type="button">Matchfakta +</button><div class="tt-details"><p><b>WTT Champions Montpellier · 31 oktober 2026</b><span>Sändningsstart 18.40 svensk tid på SVT Play. Svenska Bordtennisförbundet bekräftar Lin Shidong som kvartsfinalmotståndare. Förbundets tävlingsnotis anger 18.30 för matchen; 18.40 här avser SVT:s sändningsstart.</span></p><div><a href="https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026" target="_blank" rel="noreferrer">SVT:s sportguide ↗</a><br><a href="https://sbtf.se/landslag/truls-vidare-till-kvartsfinal-elias-utslagen/" target="_blank" rel="noreferrer">SBTF: match och schema ↗</a><br><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">WTT:s tävlingscenter ↗</a></div></div></article><p class="verification-note">Sändningsdatum, starttid och tjänst kontrollerade mot SVT den 31 oktober 2026. Motståndaren är verifierad mot Svenska Bordtennisförbundet.</p>';
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const open=root.querySelector('.tt-details').classList.toggle('open');b.textContent=open?'Stäng −':'Matchfakta +'});
}
