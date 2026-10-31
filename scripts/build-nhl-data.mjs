import { writeFile } from 'node:fs/promises';
const api='https://api-web.nhle.com/v1',pairs=[
  ['VGK','NJD'],['FLA','WPG'],
  ['CGY','SEA'],['BOS','CHI'],['DET','STL'],['LAK','BUF']
];
const standings=await fetch(`${api}/standings/now`).then(r=>r.json());
const output={updatedAt:new Date().toISOString(),standings:{},meetings:{}};
for(const row of standings.standings||[]) output.standings[row.teamAbbrev.default]={leagueSequence:row.leagueSequence,wins:row.wins,losses:row.losses,otLosses:row.otLosses,points:row.points};
for(const [a,b] of pairs){const seasons=await Promise.all([20262027,20252026].map(s=>fetch(`${api}/club-schedule-season/${a}/${s}`).then(r=>r.json())));output.meetings[`${a}-${b}`]=seasons.flatMap(x=>x.games||[]).filter(g=>(g.awayTeam?.abbrev===b||g.homeTeam?.abbrev===b)&&['OFF','FINAL'].includes(g.gameState)).sort((x,y)=>y.gameDate.localeCompare(x.gameDate)).slice(0,5).map(g=>({gameDate:g.gameDate,venue:g.venue?.default||'',awayTeam:{abbrev:g.awayTeam.abbrev,placeName:g.awayTeam.placeName?.default||g.awayTeam.abbrev,score:g.awayTeam.score},homeTeam:{abbrev:g.homeTeam.abbrev,placeName:g.homeTeam.placeName?.default||g.homeTeam.abbrev,score:g.homeTeam.score}}))}
await writeFile(new URL('../dist/nhl-data.json',import.meta.url),JSON.stringify(output));
