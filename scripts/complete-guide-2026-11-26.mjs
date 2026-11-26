import fs from 'node:fs';
import {parseHockeySchedule,parseHockeyStandings} from './hockey-official-parser.mjs';
await import('../dist/guide-data.js');const g=globalThis.sportGuide;if(g.date!=='2026-11-26')throw Error('Wrong day');
const names={FBK:'Färjestad BK',SKE:'Skellefteå AIK',FHC:'Frölunda HC',MIF:'IF Malmö Redhawks',RBK:'Rögle BK',ORE:'Örebro HK',LHF:'Luleå HF',DIF:'Djurgårdens IF',TIK:'Timrå IK',IFB:'IF Björklöven',BIF:'Brynäs IF',VLH:'Växjö Lakers HC',LHC:'Linköping HC',HV71:'HV 71'};
const aliases={'HV71':'HV71','Malmö Redhawks':'MIF','Växjö Lakers':'VLH'};for(const [c,n]of Object.entries(names))aliases[n]=c;
const load=async u=>{const r=await fetch(u);if(!r.ok)throw Error(u);return r.text()};
for(const [league,id] of [['SHL',20961],['HockeyAllsvenskan',20962]]){
 const source=`https://stats.swehockey.se/ScheduleAndResults/Schedule/${id}`;
 const games=parseHockeySchedule(await load(source));
 const ha=JSON.parse(fs.readFileSync('dist/ha-data.json','utf8'));
 const codes=league==='SHL'?aliases:Object.fromEntries(Object.entries(ha.teams).map(([c,t])=>[t.name,c]));
 if(league==='HockeyAllsvenskan'){codes['Visby Roma']='VRH';codes['MoDo']='MODO';}
 for(const e of g.events){const title=e.title.replace(/^(?:Hockeylördag|Studio): /,'');const [h,a]=title.split(' – ');if(!codes[h]||!codes[a])continue;
 const m=games.find(x=>x.date===g.date&&codes[x.home]===codes[h]&&codes[x.away]===codes[a]);if(!m)throw Error('Missing '+title);
 e.meta=`${league} · ${m.venue}`; e.facts=(e.facts||[]).filter(f=>!f.label.startsWith('Arena och karta:')); e.facts.push({label:`Arena och karta: ${m.venue}`,url:'https://www.openstreetmap.org/search?query='+encodeURIComponent(m.venue)});
 Object.assign(e,{league,home:codes[h],away:codes[a],matchTime:m.time,venue:m.venue,url:`${league==='SHL'?'shl':'hockeyallsvenskan'}.html?a=${codes[h]}&b=${codes[a]}&date=${g.date}`});
 }
 if(league==='SHL'){
 if(games.some(x=>x.date>=g.date&&Number.isInteger(x.hs)))throw Error('Unsafe standings');
 const results=games.filter(x=>x.date<g.date&&Number.isInteger(x.hs)).map(x=>({...x,home:codes[x.home],away:codes[x.away],sourceUrl:'https://stats.swehockey.se/Game/Events/'+x.id})).sort((a,b)=>b.date.localeCompare(a.date));
 if(results.some(x=>!x.home||!x.away))throw Error('Unknown club');
 const rows=parseHockeyStandings(await load(source.replace('/Schedule/','/Standings/')));
 fs.writeFileSync('dist/shl-data.js','globalThis.shlSnapshot='+JSON.stringify({checkedAt:new Date().toISOString(),sourceUpdatedAt:null,resultsThrough:results[0].date,standings:Object.fromEntries(rows.map(r=>[codes[r.name],{rank:r.rank,gp:r.gp,pts:r.pts}])),results,fixtures:g.events.filter(e=>e.league==='SHL').map(e=>({date:g.date,time:e.matchTime,home:e.home,away:e.away,venue:e.venue})),sources:{schedule:source,standings:source.replace('/Schedule/','/Standings/')}})+';\n');
 }
}
g.events=g.events.filter(e=>!e.sourceUrl?.includes('svt.se/sport/artikel/sport-pa-tv'));
for(const e of g.events)if(e.title.startsWith('ATP Finals:'))for(const f of e.facts||[])if(f.url.includes('atptour.com/en/tournaments/')){f.label='ATP Finals: officiell turneringssida';f.url='https://www.atptour.com/en/tournaments/nitto-atp-finals/605/overview';}
for(const e of g.events)if(e.sport!=='Fotboll')e.facts=(e.facts||[]).filter(f=>!f.url.includes('bundesliga.com'));
g.events.sort((a,b)=>a.sport.localeCompare(b.sport,'sv')||a.time.localeCompare(b.time));fs.writeFileSync('dist/guide-data.js','globalThis.sportGuide='+JSON.stringify(g)+';\n');await import('./version-guide-assets.mjs');console.log(g.events.length);
const svt='https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport';
for(const [sport,time,title,meta] of [['Övrigt','16:05','Världscupen i skidskytte – distans, herrar','Kontiolax · Skidskytte'],['Handboll','18:05','Sverige – Island, damer','Landskamp'],['Ishockey','22:00','Hockeykväll','Studio · SVT1 till 22:30, SVT Play till 22:45']])g.events.push({date:g.date,sport,time,title,meta,channel:'SVT1 / SVT Play',service:'SVT / SVT Play',url:svt,sourceUrl:svt,broadcastUrl:svt,startTimeUTC:`${g.date}T${String(Number(time.slice(0,2))-1).padStart(2,'0')}:${time.slice(3)}:00Z`,facts:[{label:'SVT:s officiella sändningsprogram',url:svt}]});
g.events.sort((a,b)=>a.sport.localeCompare(b.sport,'sv')||a.time.localeCompare(b.time));fs.writeFileSync('dist/guide-data.js','globalThis.sportGuide='+JSON.stringify(g)+';\n');await import('./version-guide-assets.mjs?svt26');
