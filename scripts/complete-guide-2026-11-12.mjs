import fs from 'node:fs';
await import('../dist/guide-data.js');
const g=globalThis.sportGuide;if(g.date!=='2026-11-12')throw Error('Wrong date');
const pairs=[['Brynäs IF','Skellefteå AIK','BIF','SKE','Monitor ERP Arena'],['Frölunda HC','Malmö Redhawks','FHC','MIF','Scandinavium'],['Färjestad BK','Djurgårdens IF','FBK','DIF','Löfbergs Arena'],['HV71','Luleå HF','HV71','LHF','Husqvarna Garden'],['IF Björklöven','Örebro HK','IFB','ORE','Visionite Arena'],['Linköping HC','Rögle BK','LHC','RBK','Saab Arena'],['Växjö Lakers','Timrå IK','VLH','TIK','Vida Arena']];
for(const [h,a,home,away,venue] of pairs){const e=g.events.find(e=>e.title.replace('Studio: ','')===h+' – '+a);if(!e)throw Error('Missing SHL '+h);Object.assign(e,{home,away,league:'SHL',matchTime:'19:00',venue,url:`shl.html?a=${home}&b=${away}&date=${g.date}`});e.facts=[...(e.facts||[]),{label:'Svenska Ishockeyförbundet: matchstart och arena',url:'https://stats.swehockey.se/ScheduleAndResults/Schedule/20961'}];}
const se=g.events.find(e=>e.title==='Seattle – Carolina (SE)');Object.assign(se,{league:'NHL',home:'SEA',away:'CAR',url:'nhl.html?a=SEA&b=CAR&date=2026-11-12'});
const source='https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport';
for(const [sport,time,title,channel,meta] of [['Övrigt','20:20','Belgien – Sverige','SVT24','Basket · EM-kval damer · Sändning 20.20–22.30 · Separat matchstart ej verifierad'],['Ishockey','22:10','Hockeykväll','SVT1 / SVT Play','Magasin · SVT1 till 22.40, SVT Play till 22.55']])g.events.push({date:g.date,sport,time,title,channel,meta,service:'SVT Play',url:source,sourceUrl:source,broadcastUrl:source});
g.events.sort((a,b)=>a.sport.localeCompare(b.sport,'sv')||a.time.localeCompare(b.time)||a.title.localeCompare(b.title,'sv'));
fs.writeFileSync('dist/guide-data.js','globalThis.sportGuide='+JSON.stringify(g)+';\n');
await import('./version-guide-assets.mjs');
console.log('Completed',g.events.length,'broadcasts');
