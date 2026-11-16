import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('.chip')")[0];
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm'}).format(new Date());
const make=(title,channel,service,time)=>({date:today,sport:'Ishockey',title,channel,service,time,url:'#',meta:''});
const events=[make('Streaming','TV4 Play','TV4 Play Sport Total','18:55'),make('Linear','TV4 Hockey','TV4 Play Sport Total','18:30')];
function render(channels){const root={dataset:{view:'timeline'},innerHTML:''},count={};const prefs={version:4,sports:['Ishockey'],channels};const c={document:{head:{insertAdjacentHTML(){}},querySelector:s=>s==='#events'?root:count},sportGuide:{date:today,events},localStorage:{getItem:()=>JSON.stringify(prefs)},Intl,Date};c.globalThis=c;vm.runInNewContext(source+';renderEvents();',c);return {html:root.innerHTML,count:count.textContent};}
assert.equal(render(['TV4:s sportkanaler']).count,1);assert.ok(!render(['TV4:s sportkanaler']).html.includes('Streaming'));assert.equal(render(['TV4 Play Sport Total']).count,2);assert.equal(render([]).count,0);assert.equal(render(['TV4:s sportkanaler','TV4 Play Sport Total']).count,2);
console.log('PASS: TV4 channel selection excludes Play-only broadcasts; subscription selection includes available TV4 streams, counts are correct.');
