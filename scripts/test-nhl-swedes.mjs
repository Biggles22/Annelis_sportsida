import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const snapshot=JSON.parse(fs.readFileSync('dist/nhl-swedes.json','utf8'));
const data=JSON.parse(fs.readFileSync('dist/nhl-data.json','utf8'));
const script=fs.readFileSync('dist/nhl.js','utf8');
assert.equal(Object.keys(snapshot.teams).length,32);
for(const [code,team] of Object.entries(snapshot.teams)){
 assert.ok(team.rosterSize>0);
 for(const p of team.players){
  assert.equal(p.nationality,'SWE');
  assert.deepEqual(Object.keys(p).sort(),['id','name','nationality','position']);
 }
}
async function render(a,b,roster=snapshot){
 const root={innerHTML:''};
 const c={document:{head:{insertAdjacentHTML(){}},querySelector:()=>root},location:{search:`?a=${a}&b=${b}`},
 fetch:async url=>{if(url.includes('swedes')&&roster===null)throw new Error('offline');return {ok:true,json:async()=>url.includes('swedes')?roster:data}},URLSearchParams,Intl,Date,setTimeout};
 vm.runInNewContext(script,c);await new Promise(r=>setTimeout(r,10));return root.innerHTML;
}
for(const [a,team] of Object.entries(snapshot.teams)){
 const html=await render(a,a==='TOR'?'BOS':'TOR');
 assert.ok(html.includes('Svenskar i lagen'));
 for(const p of team.players)assert.ok(html.includes(p.name.replaceAll('&','&amp;').replaceAll("'",'&#39;')));
}
assert.ok(snapshot.teams.TOR.players.some(p=>p.id===8477939),'William Nylander must not be lost due to Canadian birthplace');
assert.ok((await render('TOR','BOS',null)).includes('ännu inte verifierade'));
const old=structuredClone(snapshot);old.checkedAt='2020-01-01T12:00:00Z';
assert.ok((await render('TOR','BOS',old)).includes('inte kontrollerade i dag'));
const empty=structuredClone(snapshot);empty.teams.TOR.players=[];empty.teams.TOR.unverifiedNationality=[];
assert.ok((await render('TOR','BOS',empty)).includes('Inga spelare med svensk nationalitet'));
console.log('PASS: all 32 team views, Swedish nationality, failed/missing/stale/empty rosters and score-free fields.');
