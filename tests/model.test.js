import test from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE,blank,entries,validatePuzzle,issues,isSolved,encodePuzzle,decodePuzzle,fingerprint,symbols,isCell} from '../model.js';
test('sample is complete and all crossing words match',()=>{
 assert.deepEqual(issues(SAMPLE),[]);
 const {entries:list,numbers}=entries(SAMPLE);
 assert.equal(list.length,10);assert.equal(numbers[5],6);
 assert.deepEqual(list.filter(e=>e.direction==='down').map(e=>e.answer),['HEART','EMBER','ABUSE','RESIN','TREND']);
 assert.equal(isSolved(SAMPLE,[...SAMPLE.cells]),true);
 const letters=[...SAMPLE.cells];letters[12]='X';assert.equal(isSolved(SAMPLE,letters),false);
});
test('rectangular grids and black squares number and split correctly',()=>{
 const p=blank(4,3);p.cells=[...'AB#CDE#FGHIJ'];
 const data=entries(p);assert.deepEqual(data.entries.filter(e=>e.direction==='across').map(e=>e.answer),['AB','C','DE','F','GHIJ']);
 assert.deepEqual(data.entries.filter(e=>e.direction==='down').map(e=>e.answer),['ADG','BEH','CFJ','I']);
 assert.equal(Object.keys(data.numbers).length,7);
});
test('sharing round-trips emoji, non-ASCII names, and clue text exactly',async()=>{
 const p=structuredClone(SAMPLE);p.title='For you ❤️';p.author='Zoë';p.clues.across[0]='🫀 + ❤️ = ? <not markup>';
 const result=await decodePuzzle(await encodePuzzle(p));assert.deepEqual(result,p);
 assert.equal(fingerprint(result),fingerprint(p));
});
test('uncompressed links work when browser has no compression support',async()=>{
 const payload='j'+Buffer.from(JSON.stringify(SAMPLE)).toString('base64url');assert.deepEqual(await decodePuzzle(payload),SAMPLE);
});
test('invalid and oversized payloads fail rather than becoming puzzles',async()=>{
 assert.throws(()=>validatePuzzle({...SAMPLE,width:100}));
 assert.throws(()=>validatePuzzle({...SAMPLE,cells:['A']}));
 assert.throws(()=>validatePuzzle({...SAMPLE,cells:SAMPLE.cells.map(()=>'<script>')}));
 await assert.rejects(()=>decodePuzzle('bad link'));await assert.rejects(()=>decodePuzzle('j'+'a'.repeat(50001)));
});
test('draft validation requires both letters and clues; all-block grids cannot publish',()=>{
 assert.equal(issues(blank()).length,2);const p=blank();p.cells.fill('#');assert.deepEqual(issues(p),['Add at least one white square.']);
});
test('number changes retain clue ownership by starting cell',()=>{
 const p=structuredClone(SAMPLE);p.cells[0]='#';const entry=entries(p).entries.find(e=>e.start===5&&e.direction==='across');assert.equal(entry.clue,SAMPLE.clues.across[5]);
});
test('emoji squares retain joined, toned, flag and keycap symbols as one square',async()=>{
 const emoji=['👩🏽‍💻','🇦🇺','❤️','1️⃣','🎾'];
 assert.deepEqual(symbols(emoji.join('')),emoji);
 for(const value of emoji) assert.equal(isCell(value),true);
 for(const value of ['AB','😀😀','<script>','a','']) assert.equal(isCell(value),false);
 const p=structuredClone(SAMPLE);p.cells.splice(0,5,...emoji);
 assert.deepEqual(await decodePuzzle(await encodePuzzle(p)),p);
 assert.equal(entries(p).entries.find(e=>e.id==='across-0').indices.length,5);
 assert.equal(isSolved(p,[...p.cells]),true);
});
test('emoji that share a UTF-16 high surrogate do not reuse saved progress',()=>{
 const a=structuredClone(SAMPLE),b=structuredClone(SAMPLE);
 a.title='😀';b.title='😃';assert.notEqual(fingerprint(a),fingerprint(b));
});
test('disconnected white islands cannot be shared as a crossword',()=>{
 const p=blank(3,3);p.cells=[...'ABC###DEF'];
 assert.ok(issues(p).some(x=>x.includes('Connect every white square')));
 assert.ok(!issues(SAMPLE).some(x=>x.includes('Connect every white square')));
});
