import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const guideContext={globalThis:{}};vm.runInNewContext(fs.readFileSync('dist/guide-data.js','utf8'),guideContext);
const guide=guideContext.globalThis.sportGuide,today=guide.date;
assert.equal(today,process.argv[2]||new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date()));assert.ok(guide.events.length>0);
for(const e of guide.events){for(const k of ['date','time','sport','title','channel','service','sourceUrl','broadcastUrl'])assert.ok(e[k],k);if(!e.url.startsWith('http'))assert.ok(fs.existsSync('dist/'+e.url.split('?')[0]));}

const nhl=JSON.parse(fs.readFileSync('dist/nhl-data.json','utf8'));
const fixture=nhl.fixtures[0],a=fixture.homeTeam.abbrev,b=fixture.awayTeam.abbrev;
const bad={...structuredClone(fixture),startTimeUTC:today+'T12:00:00Z',homeTeam:{abbrev:a,score:999},awayTeam:{abbrev:b,score:888}};
for(const selected of [today,'2099-01-01']){
 const data=structuredClone(nhl);data.meetings[a+'-'+b]=[bad];data.results[a]=[bad];data.pregameStandings={};data.standings[a]={points:999,wins:999,leagueSequence:999};
 const root={innerHTML:'',before(){},after(){}},extra=[];
 const c={document:{head:{insertAdjacentHTML(){}},querySelector:()=>root,createElement(){const x={innerHTML:''};extra.push(x);return x;}},location:{pathname:'/nhl.html',search:'?a='+a+'&b='+b+'&date='+selected},fetch:async()=>({json:async()=>data}),URLSearchParams,Intl,Date,setTimeout,sportGuide:guide};c.globalThis=c;vm.createContext(c);
 vm.runInContext(fs.readFileSync('dist/nhl.js','utf8'),c);vm.runInContext(fs.readFileSync('dist/match-context.js','utf8'),c);await new Promise(r=>setTimeout(r,10));
 const html=root.innerHTML+extra.map(x=>x.innerHTML).join('');assert.ok(!html.includes('999')&&!html.includes('888'));assert.ok(html.includes('aktuell tabell döljs'));
}
const ha=JSON.parse(fs.readFileSync('dist/ha-data.json','utf8'));ha.resultsThrough=today;ha.results.unshift({date:today,home:'LIF',away:'AIK',hs:999,as:888});
for(const selected of [today,'2099-01-01']){const root={innerHTML:''};const c={document:{head:{insertAdjacentHTML(){}},querySelector:()=>root},location:{search:'?a=LIF&b=AIK&date='+selected},fetch:async()=>({ok:true,json:async()=>ha}),URLSearchParams,Intl,Date,setTimeout};vm.runInNewContext(fs.readFileSync('dist/ha.js','utf8'),c);await new Promise(r=>setTimeout(r,10));assert.ok(!root.innerHTML.includes('999')&&!root.innerHTML.includes('888'));assert.ok(root.innerHTML.includes('aktuell tabell döljs'));}
console.log('PASS: current guide fields and internal match links; actual NHL/HA renderers block current results and table spoilers for today and future URL dates.');

const shlContext={globalThis:{}};vm.runInNewContext(fs.readFileSync('dist/shl-data.js','utf8'),shlContext);
for(const path of ['/shl.html','/shl'])for(const selected of [today,'2099-01-01']){
 const data=structuredClone(shlContext.globalThis.shlSnapshot);data.resultsThrough=today;data.results.unshift({date:today,home:'VLH',away:'TIK',hs:999,as:888,venue:'Test'});
 const root={innerHTML:'',before(){},after(){}},extra=[];
 const c={document:{head:{insertAdjacentHTML(){}},querySelector:()=>root,createElement(){const x={innerHTML:''};extra.push(x);return x;}},location:{pathname:path,search:'?a=VLH&b=TIK&date='+selected},URLSearchParams,Intl,Date,setTimeout,sportGuide:guide,shlSnapshot:data};c.globalThis=c;vm.createContext(c);
 vm.runInContext(fs.readFileSync('dist/shl.js','utf8'),c);vm.runInContext(fs.readFileSync('dist/match-context.js','utf8'),c);await new Promise(r=>setTimeout(r,10));
 const html=root.innerHTML+extra.map(x=>x.innerHTML).join('');assert.ok(!html.includes('999')&&!html.includes('888'));assert.ok(html.includes('aktuell tabell döljs'));
 if(selected===today&&guide.events.some(e=>e.league==='SHL'&&e.home==='VLH'&&e.away==='TIK'))assert.ok(html.includes('Matchstart 19:00'));
}
console.log('PASS: SHL actual renderer, clean Sites routes, separate match start, today/future result and table guards.');
