import {readFile,writeFile} from 'node:fs/promises';
import {parseHockeySchedule,parseHockeyStandings} from './hockey-official-parser.mjs';
const file=new URL('../dist/ha-data.json',import.meta.url);
const data=JSON.parse(await readFile(file,'utf8'));
const load=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('HTTP '+r.status);return r.text();};
const [schedule,table]=await Promise.all([load(data.sources.schedule),load(data.sources.standings)]);
const games=parseHockeySchedule(schedule),standings=parseHockeyStandings(table);
const names=Object.fromEntries(Object.entries(data.teams).map(([code,t])=>[t.name,code]));
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date());
if(games.some(g=>g.date>=today&&Number.isInteger(g.hs)))throw Error('Tabellen kan innehålla dagens resultat; förmatchsnapshot krävs');
const results=games.filter(g=>g.date<today&&Number.isInteger(g.hs)&&names[g.home]&&names[g.away]).map(g=>({...g,home:names[g.home],away:names[g.away],sourceUrl:g.id?'https://stats.swehockey.se/Game/Events/'+g.id:data.sources.schedule}));
if(!results.length)throw Error('Inga avslutade resultat tolkades');
for(const row of standings){const code=names[row.name];if(!code)throw Error('Okänt officiellt lag '+row.name);Object.assign(data.teams[code],{pos:row.rank,gp:row.gp,points:row.pts});}
data.results=results;data.resultsThrough=results.map(g=>g.date).sort().at(-1);data.checkedAt=new Date().toISOString();data.sourceUpdatedAt=null;
await writeFile(file,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({results:results.length,resultsThrough:data.resultsThrough,teams:standings.length}));
