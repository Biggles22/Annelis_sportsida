const matches=[
 {time:'12:35',a:'Lin Shidong',af:'🇨🇳',ar:null,b:'An Jaehyun',bf:'🇰🇷',br:null},
 {time:'13:45',a:'Simon Gauzy',af:'🇫🇷',ar:null,b:'Liang Jingkun',bf:'🇨🇳',br:null},
 {time:'14:55',a:'Patrick Franziska',af:'🇩🇪',ar:null,b:'Elias Ranefur',bf:'🇸🇪',br:29},
 {time:'19:05',a:'Dimitrij Ovtcharov',af:'🇩🇪',ar:null,b:'Hugo Calderano',bf:'🇧🇷',br:null},
 {time:'20:15',a:'Zhou Qihao',af:'🇨🇳',ar:null,b:'Félix Lebrun',bf:'🇫🇷',br:2}
];
const root=document.querySelector('#tt-matches');root.innerHTML=matches.map((m,i)=>`<article class="tt-match"><time>${m.time}</time><div class="tt-player"><span>${m.af}</span><div><b>${m.a}</b><small>${m.ar?`Världsranking #${m.ar}`:'Placering ej verifierad'}</small></div></div><strong class="tt-vs">MOT</strong><div class="tt-player right"><div><b>${m.b}</b><small>${m.br?`Världsranking #${m.br}`:'Placering ej verifierad'}</small></div><span>${m.bf}</span></div><button type="button" data-i="${i}">Matchfakta +</button><div class="tt-details" id="detail-${i}"><p><b>Senaste inbördes möten</b><span>Resultathistoriken är inte verifierad i den officiella källan ännu.</span></p><a href="https://www.worldtabletennis.com/eventslist" target="_blank" rel="noreferrer">Öppna WTT:s matchcenter ↗</a></div></article>`).join('');root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=document.querySelector(`#detail-${b.dataset.i}`),open=d.classList.toggle('open');b.textContent=open?'Stäng −':'Matchfakta +'});
