import fs from 'node:fs';
import {parseHockeySchedule} from './hockey-official-parser.mjs';
await import('../dist/guide-data.js');const g=globalThis.sportGuide;
const d=JSON.parse(fs.readFileSync('dist/ha-data.json','utf8'));
const source=d.sources.schedule;const r=await fetch(source);if(!r.ok)throw Error('HA source failed');const games=parseHockeySchedule(await r.text());
for(const e of g.events.filter(x=>x.league==='HockeyAllsvenskan')){const m=games.find(x=>x.date===g.date&&x.home===d.teams[e.home].name&&x.away===d.teams[e.away].name);if(!m?.time)throw Error('Missing match '+e.title);Object.assign(e,{matchTime:m.time,venue:m.venue});}
const svt='https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport';
for(const [sport,time,title,channel,meta] of [['Övrigt','18:55','Ungdoms-OS – avslutning','SVT Play','Avslutning · 18.55–19.30'],['Ishockey','19:00','Sverige – Schweiz','SVT2 / SVT24','Damernas VM · Kvartsfinal · SVT2 till 21.00, därefter SVT24 till 21.30 · Separat matchstart ej verifierad'],['Fotboll','19:40','Presskonferens inför Bosnien-Hercegovina','SVT Play','Nations League · SVT Sport Direkt']])g.events.push({date:g.date,sport,time,title,channel,meta,service:'SVT Play',url:svt,sourceUrl:svt,broadcastUrl:svt});
g.events.sort((a,b)=>a.sport.localeCompare(b.sport,'sv')||a.time.localeCompare(b.time));fs.writeFileSync('dist/guide-data.js','globalThis.sportGuide='+JSON.stringify(g)+';\n');await import('./version-guide-assets.mjs');console.log(g.events.length);
