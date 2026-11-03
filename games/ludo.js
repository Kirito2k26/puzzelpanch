window.PPGames=window.PPGames||{};
PPGames.ludo={init(ctx){
 const colors=['red','blue','yellow','green'],starts=[0,13,26,39],safe=new Set([0,8,13,21,26,34,39,47]);
 const ring=[...[1,2,3,4,5].map(c=>[6,c]),...[5,4,3,2,1,0].map(r=>[r,6]),[0,7],[0,8],...[1,2,3,4,5].map(r=>[r,8]),...[9,10,11,12,13,14].map(c=>[6,c]),[7,14],[8,14],...[13,12,11,10,9].map(c=>[8,c]),...[9,10,11,12,13,14].map(r=>[r,8]),[14,7],[14,6],...[13,12,11,10,9].map(r=>[r,6]),...[5,4,3,2,1,0].map(c=>[8,c]),[7,0],[6,0]];
 const lanes=[Array.from({length:6},(_,i)=>[7,i+1]),Array.from({length:6},(_,i)=>[i+1,7]),Array.from({length:6},(_,i)=>[7,13-i]),Array.from({length:6},(_,i)=>[13-i,7])];
 const corners=[[0,0],[0,9],[9,9],[9,0]];
 let s=ctx.restore();if(!s||!Array.isArray(s.tokens)||s.tokens.some(t=>!Array.isArray(t)||t.length!==4))s=fresh(2);
 s.types=Array.isArray(s.types)&&s.types.length===s.players?s.types:Array(s.players).fill('human');
 s.mode=s.players===4&&s.mode==='team'?'team':'individual';
 let aiTimer=null,moveTimer=null,moving=false;
 function fresh(n,types,mode='individual'){return {players:n,mode,types:types||Array(n).fill('human'),tokens:Array.from({length:n},()=>[-1,-1,-1,-1]),turn:0,roll:0,done:false}}
 function name(p){return 'Player '+(p+1)+(s.types[p]==='computer'?' (Computer)':' (Human)')}
 function started(){return s.tokens.some(a=>a.some(v=>v!==-1))||!!s.roll}
 function roll(){
  if(ctx.paused||s.done||s.roll||moving)return;
  const p=s.turn;s.roll=1+Math.floor(Math.random()*6);
  ctx.message(name(p)+' rolled '+s.roll);
  if(!options(p,s.roll).length){ctx.message(name(p)+' rolled '+s.roll+' — no legal moves');s.roll=0;s.turn=(p+1)%s.players}
  save();render();if(s.roll&&options(s.turn,s.roll).length===1)scheduleOnlyMove();
 }
 function aiChoice(p,d){
  return options(p,d).map(i=>{
   const old=s.tokens[p][i],v=old===-1?0:old+d;
   let score=v===57?1000:old===-1?65:10+v*.35;
   if(v<51){const cell=(starts[p]+v)%52;
    if(safe.has(cell))score+=12;
    else for(let op=0;op<s.players;op++)if(op!==p)for(let j=0;j<4;j++){
     const ov=s.tokens[op][j];if(!(s.mode==='team'&&s.players===4&&op%2===p%2)&&ov>=0&&ov<51&&(starts[op]+ov)%52===cell)score+=150;
    }
   }
   return {i,score:score+Math.random()*8};
  }).sort((a,b)=>b.score-a.score)[0]?.i;
 }
 function scheduleAI(){
  clearTimeout(aiTimer);
  if(!ctx.active()||s.done||moving||s.types[s.turn]!=='computer')return;
  aiTimer=setTimeout(()=>{
   if(!ctx.active()||s.done||moving)return;
   if(ctx.paused){scheduleAI();return}
   if(!s.roll)roll();
   else {const i=aiChoice(s.turn,s.roll);if(i!==undefined)move(i)}
  },700);
 }
 function save(){ctx.save(s)}
 function options(p,d){return s.tokens[p].map((v,i)=>v===-1?(d===6?i:-1):(v<57&&v+d<=57?i:-1)).filter(i=>i>=0)}
 function position(p,v,i){if(v<0){const [r,c]=corners[p];return [r+1+Math.floor(i/2)*2,c+1+(i%2)*2]}if(v===57)return [7,7];if(v>=51)return lanes[p][v-51];return ring[(starts[p]+v)%52]}
 function scheduleOnlyMove(){
  if(moving||!s.roll||s.done||ctx.paused||s.types[s.turn]!=='human')return;
  const legal=options(s.turn,s.roll);
  if(legal.length===1){clearTimeout(moveTimer);moveTimer=setTimeout(()=>{if(!ctx.active()||ctx.paused){scheduleOnlyMove();return}if(!moving&&s.roll&&options(s.turn,s.roll).length===1)move(legal[0])},380)}
 }
 function move(i){if(ctx.paused||s.done||moving||!s.roll||!options(s.turn,s.roll).includes(i))return;
  moving=true;clearTimeout(aiTimer);clearTimeout(moveTimer);
  const p=s.turn,old=s.tokens[p][i],dice=s.roll,steps=old===-1?1:dice;
  let step=0;
  function advance(){
   if(!ctx.active()){moving=false;return}
   if(ctx.paused){moveTimer=setTimeout(advance,100);return}
   step++;
   s.tokens[p][i]=old===-1?0:old+step;
   ctx.sound('move');render();
   if(step<steps){moveTimer=setTimeout(advance,250);return}
   finishMove();
  }
  function finishMove(){
   const v=s.tokens[p][i];let captured=false;
   if(v<51){const cell=(starts[p]+v)%52;if(!safe.has(cell))for(let op=0;op<s.players;op++)if(op!==p)for(let j=0;j<4;j++){
    const ov=s.tokens[op][j];if(!(s.mode==='team'&&s.players===4&&op%2===p%2)&&ov>=0&&ov<51&&(starts[op]+ov)%52===cell){s.tokens[op][j]=-1;captured=true}
   }}
   if(s.mode==='team'&&s.players===4?s.tokens.every((a,k)=>k%2!==p%2||a.every(x=>x===57)):s.tokens[p].every(x=>x===57)){s.done=true;ctx.win(s.mode==='team'?'Team '+(p%2===0?'A (Red + Yellow)':'B (Blue + Green)')+' wins!':name(p)+' wins!')}
   const extra=dice===6||captured;s.roll=0;if(!extra&&!s.done)s.turn=(p+1)%s.players;
   moving=false;ctx.message(captured?'Captured an opponent token!':v===57?'Token reached home!':'Token moved.');ctx.sound('button');save();render();
  }
  advance();
 }
 function render(){
  ctx.board.innerHTML='';const board=document.createElement('div');board.className='ludo-board';
  for(let r=0;r<15;r++)for(let c=0;c<15;c++){
   const cell=document.createElement('div');cell.className='ludo-cell';
   const corner=r<6&&c<6?0:r<6&&c>8?1:r>8&&c>8?2:r>8&&c<6?3:-1;
   if(corner>=0)cell.classList.add('ludo-zone',colors[corner]);
   if(r>=6&&r<=8&&c>=6&&c<=8)cell.classList.add('ludo-center');
   if(r===7&&c===7)cell.textContent='★';
   for(let p=0;p<4;p++)if(lanes[p].some(([lr,lc])=>lr===r&&lc===c))cell.classList.add('ludo-lane',colors[p]);
   ring.forEach(([rr,cc],idx)=>{if(rr===r&&cc===c){if(safe.has(idx))cell.classList.add('ludo-safe');const owner=starts.indexOf(idx);if(owner>=0)cell.classList.add('ludo-start',colors[owner])}});
   cell.style.gridRow=r+1;cell.style.gridColumn=c+1;board.append(cell);
  }
  const piles=new Map();for(let p=0;p<s.players;p++)for(let i=0;i<4;i++){
   const v=s.tokens[p][i],[r,c]=position(p,v,i),id=r+','+c;if(!piles.has(id))piles.set(id,[]);piles.get(id).push({p,i,v,r,c});
  }
  for(const pile of piles.values())pile.forEach(({p,i,v,r,c},j)=>{
   const token=document.createElement('button');token.className='ludo-piece '+colors[p];token.textContent=v===57?'★':'';
   token.style.left=`${(c+.5+(pile.length>1?(j%2-.5)*.28:0))/15*100}%`;
   token.style.top=`${(r+.5+(pile.length>2?(Math.floor(j/2)-.5)*.28:0))/15*100}%`;
   token.title=name(p)+' token '+(i+1)+(v<0?' (home)':v===57?' (finished)':' (step '+v+')');
   const enabled=p===s.turn&&s.types[p]==='human'&&s.roll&&options(p,s.roll).includes(i)&&!ctx.paused&&!s.done&&!moving;
   token.disabled=!enabled;if(enabled)token.classList.add('can-move');token.onclick=()=>move(i);board.append(token);
  });ctx.board.append(board);
  ctx.stats.textContent=(s.mode==='team'?'Team '+(s.turn%2===0?'A':'B')+' · ':'')+name(s.turn)+' ('+colors[s.turn]+') to play'+(s.roll?' · Rolled '+s.roll:'');ctx.controls.innerHTML='';
  const sel=document.createElement('select');[2,3,4].forEach(n=>sel.add(new Option(n+' players',n)));sel.value=s.players;sel.disabled=started();
  sel.onchange=()=>{s=fresh(+sel.value,undefined,+sel.value===4?s.mode:'individual');save();render()};const label=document.createElement('label');label.textContent='Players: ';label.append(sel);ctx.controls.append(label);
  if(s.players===4){const ml=document.createElement('label');ml.textContent='Match type: ';const ms=document.createElement('select');ms.add(new Option('Individual · 4 players','individual'));ms.add(new Option('Teams · Red + Yellow vs Blue + Green','team'));ms.value=s.mode;ms.disabled=started();ms.onchange=()=>{s=fresh(4,s.types.slice(),ms.value);save();render()};ml.append(ms);ctx.controls.append(ml)}
  const setup=document.createElement('div');setup.className='ai-seat-setup';
  for(let p=0;p<s.players;p++){
   const seat=document.createElement('label');seat.className='ai-seat';
   const nameTag=document.createElement('span');nameTag.textContent='Player '+(p+1)+' ('+colors[p]+')';
   const type=document.createElement('select');type.setAttribute('aria-label','Player '+(p+1)+' type');
   type.add(new Option('Human','human'));type.add(new Option('Computer','computer'));
   type.value=s.types[p];type.disabled=started();
   type.onchange=()=>{s.types[p]=type.value;save();render()};
   seat.append(nameTag,type);setup.append(seat);
  }
  ctx.controls.append(setup);
  const btn=document.createElement('button');btn.className='primary';
  btn.textContent=s.roll?'Select a glowing token':'🎲 Roll dice';
  btn.disabled=!!s.roll||s.done||moving||s.types[s.turn]==='computer';
  btn.onclick=roll;ctx.controls.append(btn);
  if(s.types[s.turn]==='computer'&&!s.done){
   const waiting=document.createElement('span');waiting.className='ai-waiting';waiting.textContent='🤖 '+name(s.turn)+' is thinking…';ctx.controls.append(waiting);
  }
  if(!moving)scheduleAI();
  const tip=document.createElement('p');tip.className='tip';tip.textContent='Traditional cross-shaped Ludo board. Roll 6 to enter; choose a glowing token. Safe squares protect tokens. Reach the center with an exact roll.';ctx.controls.append(tip);
 }render();return ()=>{clearTimeout(aiTimer);clearTimeout(moveTimer)};
}};
