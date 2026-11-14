import fs from 'node:fs';
import {parseHockeySchedule,parseHockeyStandings} from './hockey-official-parser.mjs';
await import('../dist/guide-data.js');const g=globalThis.sportGuide;if(g.date!=='2026-11-14')throw Error('Wrong day');
const names={FBK:'Färjestad BK',SKE:'Skellefteå AIK',FHC:'Frölunda HC',MIF:'IF Malmö Redhawks',RBK:'Rögle BK',ORE:'Örebro HK',LHF:'Luleå HF',DIF:'Djurgårdens IF',TIK:'Timrå IK',IFB:'IF Björklöven',BIF:'Brynäs IF',VLH:'Växjö Lakers HC',LHC:'Linköping HC',HV71:'HV 71'};
const aliases={'HV71':'HV71','Malmö Redhawks':'MIF','Växjö Lakers':'VLH'};for(const [c,n]of Object.entries(names))aliases[n]=c;
const load=async u=>{const r=await fetch(u);if(!r.ok)throw Error(u);return r.text()};
for(const [league,id] of [['SHL',20961],['HockeyAllsvenskan',20962]]){
 const source=`https://stats.swehockey.se/ScheduleAndResults/Schedule/${id}`;
 const games=parseHockeySchedule(await load(source));
 const ha=JSON.parse(fs.readFileSync('dist/ha-data.json','utf8'));
 const codes=league==='SHL'?aliases:Object.fromEntries(Object.entries(ha.teams).map(([c,t])=>[t.name,c]));
 for(const e of g.events){const title=e.title.replace(/^Hockeylördag: /,'');const [h,a]=title.split(' – ');if(!codes[h]||!codes[a])continue;
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
// The Swedish commentary version is the same Carolina–Seattle fixture.
for(const e of g.events.filter(e=>e.title==='Carolina – Seattle (SE)'))Object.assign(e,{league:'NHL',home:'CAR',away:'SEA',url:`nhl.html?a=CAR&b=SEA&date=${g.date}`});
const svt='https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport';
for(const [time,title,meta]of [['09:30','Vinterstudion – säsongspremiär','09.30–14.00'],['10:00','Skidskytte: Sverigepremiär i Idre – kortdistans damer','10.00–11.30'],['12:15','Skidskytte: Sverigepremiär i Idre – kortdistans herrar','12.15–13.20']])g.events.push({date:g.date,time,title,meta,sport:'Övrigt',channel:'SVT1',service:'SVT Play',sourceUrl:svt,broadcastUrl:svt,url:svt});
g.events.sort((a,b)=>a.sport.localeCompare(b.sport,'sv')||a.time.localeCompare(b.time));fs.writeFileSync('dist/guide-data.js','globalThis.sportGuide='+JSON.stringify(g)+';\n');await import('./version-guide-assets.mjs');console.log(g.events.length);
