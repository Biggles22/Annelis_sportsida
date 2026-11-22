import fs from 'node:fs';
import {parseHockeySchedule,parseHockeyStandings} from './hockey-official-parser.mjs';
await import('../dist/guide-data.js');const g=globalThis.sportGuide;if(g.date!=='2026-11-22')throw Error('Wrong day');
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
const svt='https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport';
for(const [time,end,channel,title] of [['10:00','11:00','SVT Play','Bruksvallarna: 10 km fristil, herrar'],['10:30','13:45','SVT1 / SVT Play','Vinterstudion'],['11:00','11:55','SVT1 / SVT Play','Bruksvallarna: 10 km fristil, herrar'],['12:05','12:30','SVT Play','Bruksvallarna: 10 km fristil, damer'],['12:30','13:20','SVT1 / SVT Play','Bruksvallarna: 10 km fristil, damer']])g.events.push({date:g.date,sport:'Längdskidor',time,title,meta:'Sändning till '+end,channel,service:'SVT Play',url:svt,sourceUrl:svt,broadcastUrl:'https://www.svtplay.se/sport',startTimeUTC:new Date(g.date+'T'+time+':00+01:00').toISOString()});
for(const e of g.events.filter(e=>e.league==='Allsvenskan'))e.matchTime=e.home==='BP'?'16:30':'14:00';
g.events.push({date:g.date,sport:'Fotboll',time:'12:50',title:'Manchester City – Tottenham',meta:'Women’s Super League · Sändning till 15:00',channel:'SVT Play',service:'SVT Play',url:svt,sourceUrl:svt,broadcastUrl:'https://www.svtplay.se/sport',startTimeUTC:g.date+'T11:50:00Z'});
for(const e of g.events.filter(e=>e.title.endsWith(' (SE)'))){const other=g.events.find(x=>x.league==='NHL'&&x.title.replace(/ \(ENG\)$/,'')===e.title.replace(/ \(SE\)$/,''));if(other)Object.assign(e,{league:other.league,home:other.home,away:other.away,url:other.url});}
g.events.sort((a,b)=>a.sport.localeCompare(b.sport,'sv')||a.time.localeCompare(b.time));fs.writeFileSync('dist/guide-data.js','globalThis.sportGuide='+JSON.stringify(g)+';\n');await import('./version-guide-assets.mjs');console.log(g.events.length);
