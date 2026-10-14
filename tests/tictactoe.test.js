// Run with: node tests/tictactoe.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'../games/tictactoe.js'),'utf8');
function harness(){
  const elements = {cells:[],select:null};
  const board = {set innerHTML(html){this.html=html;elements.cells=[...html.matchAll(/data-i="(\d+)"/g)].map(m=>({dataset:{i:m[1]},onclick:null}));},querySelectorAll(){return elements.cells}};
  const controls={set innerHTML(html){this.html=html;elements.select={value:'ai',onchange:null}},querySelector(){return elements.select}};
  const store=new Map();const games={};const context={window:{PPGames:games},PPGames:games,PPStorage:{get:(k,d)=>store.has(k)?store.get(k):d,set:(k,v)=>store.set(k,v)},PPUtils:{choice:a=>a[0]},setTimeout:()=>{}};
  vm.runInNewContext(source,context);
  const ctx={board,controls,stats:{textContent:''},difficulty:'medium',paused:false,restore:()=>null,sound:()=>{},message:()=>{},save:()=>{},active:()=>true};
  context.PPGames.tictactoe.init(ctx);
  return {elements,board,ctx,click(i){elements.cells[i].onclick()},friend(){elements.select.value='friend';elements.select.onchange()}};
}
const t=harness();t.friend();t.click(0);assert.match(t.board.html,/class="ttt-cell x" data-i="0"/);t.click(1);assert.match(t.board.html,/class="ttt-cell o" data-i="1"/,'second friend click should place O');t.click(3);assert.match(t.board.html,/class="ttt-cell x" data-i="3"/);t.click(4);assert.match(t.board.html,/class="ttt-cell o" data-i="4"/);t.click(6);assert.match(t.board.html,/Round over|disabled/);assert.match(t.ctx.stats.textContent,/X wins 1/);console.log('PASS: friend turns alternate X/O and wins are detected');
