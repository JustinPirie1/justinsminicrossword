const segmenter = new Intl.Segmenter('en', {granularity:'grapheme'});
export function symbols(text) { return [...segmenter.segment(text)].map(x=>x.segment); }
export function isCell(value) {
  return typeof value === 'string' && (/^[A-Z]$/.test(value) ||
    (value.length <= 32 && symbols(value).length === 1 &&
      /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u.test(value)));
}
export const SAMPLE = {
  version: 1, title: 'The Mini', author: 'Justin', width: 5, height: 5,
  cells: [...'HEARTEMBERABUSERESINTREND'],
  clues: { across: {'0':'It might skip a beat', '5':'A little glow after the fire', '10':'Treat badly', '15':'Sticky stuff from a pine tree', '20':'What’s catching on'}, down: {'0':'Wear it on your sleeve, figuratively', '1':'A coal that’s still glowing', '2':'Misuse, as a privilege', '3':'Amber, before it hardens', '4':'The direction things are heading'} }
};
export function blank(width = 5, height = 5) {
  return {version:1, title:'My Mini', author:'Justin', width, height, cells:Array(width*height).fill(''), clues:{across:{},down:{}}};
}
export function entries(puzzle) {
  const {width:w, height:h, cells} = puzzle, result = [], numbers = {}; let number = 0;
  for (let i = 0; i < w*h; i++) {
    if (cells[i] === '#') continue;
    const a = i % w === 0 || cells[i-1] === '#';
    const d = i < w || cells[i-w] === '#';
    if (!a && !d) continue;
    numbers[i] = ++number;
    for (const [direction, starts, step] of [['across',a,1],['down',d,w]]) {
      if (!starts) continue;
      const indices = []; let j = i;
      while (j < w*h && cells[j] !== '#') {
        indices.push(j); if(direction === 'across' && j % w === w-1) break; j += step;
      }
      result.push({id:`${direction}-${i}`, direction, start:i, number, indices, answer:indices.map(k=>cells[k] || '').join(''), clue:puzzle.clues[direction][i] || ''});
    }
  }
  return {entries:result, numbers};
}
export function validatePuzzle(raw) {
  if (!raw || raw.version !== 1 || !Number.isInteger(raw.width) || !Number.isInteger(raw.height) || raw.width < 3 || raw.width > 15 || raw.height < 3 || raw.height > 15) throw new Error('Choose a grid between 3 and 15 squares on each side.');
  if (!Array.isArray(raw.cells) || raw.cells.length !== raw.width*raw.height || raw.cells.some(c=>c!=='' && c!=='#' && !isCell(c))) throw new Error('Use one letter or emoji per white square, or a black square.');
  if (typeof raw.title !== 'string' || raw.title.length > 100 || typeof raw.author !== 'string' || raw.author.length > 60) throw new Error('Please use a title up to 100 characters and a name up to 60 characters.');
  const clues = {across:{},down:{}};
  for(const direction of ['across','down']) {
    if(!raw.clues || !raw.clues[direction] || typeof raw.clues[direction] !== 'object') throw new Error('This puzzle is missing its clues.');
    for(const [key,value] of Object.entries(raw.clues[direction])) {
      if(!/^\d+$/.test(key) || Number(key)>=raw.cells.length || typeof value !== 'string' || value.length>500) throw new Error('A clue has an invalid position or is too long.');
      clues[direction][key]=value;
    }
  }
  return {version:1,width:raw.width,height:raw.height,cells:[...raw.cells],title:raw.title,author:raw.author,clues};
}
export function issues(puzzle) {
  const problems = [];
  const open = puzzle.cells.filter(c=>c!=='#');
  if(!open.length) return ['Add at least one white square.'];
  if(open.some(c=>!c)) problems.push('Fill every white square with a letter or emoji.');
  const list = entries(puzzle).entries;
  if(list.some(e=>!e.clue.trim())) problems.push('Add a clue for every Across and Down answer.');
  const reachable=new Set(), pending=[puzzle.cells.findIndex(c=>c!=='#')];
  while(pending.length) {
    const i=pending.pop(); if(reachable.has(i)) continue; reachable.add(i);
    for(const j of [i%puzzle.width?i-1:-1,i%puzzle.width<puzzle.width-1?i+1:-1,i-puzzle.width,i+puzzle.width])
      if(j>=0 && j<puzzle.cells.length && puzzle.cells[j]!=='#' && !reachable.has(j)) pending.push(j);
  }
  if(reachable.size!==open.length) problems.push('Connect every white square to the rest of the grid.');
  if(!puzzle.title.trim()) problems.push('Give your puzzle a title.');
  return problems;
}
export function fingerprint(puzzle) {
  const s=JSON.stringify(validatePuzzle(puzzle)); let hash=2166136261;
  for(let i=0;i<s.length;i++) hash=Math.imul(hash^s.charCodeAt(i),16777619);
  return (hash>>>0).toString(36);
}
export function isSolved(puzzle, letters) { return puzzle.cells.every((c,i)=>c==='#'||c===letters[i]); }
export async function encodePuzzle(puzzle) {
  const bytes=new TextEncoder().encode(JSON.stringify(validatePuzzle(puzzle)));
  let data=bytes, prefix='j';
  if(typeof CompressionStream !== 'undefined') {
    data=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer()); prefix='z';
  }
  const payload=prefix+btoa(String.fromCharCode(...data)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  if(payload.length>50000) throw new Error('This puzzle is too large for a link. Export JSON instead.');
  return payload;
}
export async function decodePuzzle(payload) {
  if(!payload || payload.length>50000 || !/^[jz][A-Za-z0-9_-]+$/.test(payload)) throw new Error('This puzzle link is invalid or too large.');
  let bytes=Uint8Array.from(atob(payload.slice(1).replaceAll('-','+').replaceAll('_','/')), c=>c.charCodeAt(0));
  if(payload[0]==='z') {
    if(typeof DecompressionStream==='undefined') throw new Error('Please open this puzzle in an up-to-date browser.');
    const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
    const parts=[]; let length=0;
    while(true) { const {value,done}=await reader.read(); if(done) break; length+=value.length; if(length>100000){await reader.cancel();throw new Error('This puzzle is too large.');} parts.push(value); }
    bytes=new Uint8Array(length); let offset=0; for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  }
  return validatePuzzle(JSON.parse(new TextDecoder().decode(bytes)));
}
