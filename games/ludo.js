window.PPGames=window.PPGames||{};
PPGames.ludo={init(ctx){
 const colors=['red','blue','yellow','green'],starts=[0,13,26,39],safe=new Set([0,8,13,21,26,34,39,47]);
 const ring=[...[1,2,3,4,5].map(c=>[6,c]),...[5,4,3,2,1,0].map(r=>[r,6]),[0,7],[0,8],...[1,2,3,4,5].map(r=>[r,8]),...[9,10,11,12,13,14].map(c=>[6,c]),[7,14],[8,14],...[13,12,11,10,9].map(c=>[8,c]),...[9,10,11,12,13,14].map(r=>[r,8]),[14,7],[14,6],...[13,12,11,10,9].map(r=>[r,6]),...[5,4,3,2,1,0].map(c=>[8,c]),[7,0],[6,0]];
 const lanes=[Array.from({length:6},(_,i)=>[7,i+1]),Array.from({length:6},(_,i)=>[i+1,7]),Array.from({length:6},(_,i)=>[7,13-i]),Array.from({length:6},(_,i)=>[13-i,7])];
 const corners=[[0,0],[0,9],[9,9],[9,0]];
 let s=ctx.restore();if(!s||!Array.isArray(s.tokens)||s.tokens.some(t=>!Array.isArray(t)||t.length!==4))s=fresh(2);
 function fresh(n){return {players:n,tokens:Array.from({length:n},()=>[-1,-1,-1,-1]),turn:0,roll:0,done:false}}
 function save(){ctx.save(s)}
 function options(p,d){return s.tokens[p].map((v,i)=>v===-1?(d===6?i:-1):(v<57&&v+d<=57?i:-1)).filter(i=>i>=0)}
 function position(p,v,i){if(v<0){const [r,c]=corners[p];return [r+1+Math.floor(i/2)*2,c+1+(i%2)*2]}if(v===57)return [7,7];if(v>=51)return lanes[p][v-51];return ring[(starts[p]+v)%52]}
 function move(i){if(ctx.paused||s.done||!s.roll||!options(s.turn,s.roll).includes(i))return;
  const p=s.turn,old=s.tokens[p][i],v=old===-1?0:old+s.roll;s.tokens[p][i]=v;let captured=false;
  if(v<51){const cell=(starts[p]+v)%52;if(!safe.has(cell))for(let op=0;op<s.players;op++)if(op!==p)for(let j=0;j<4;j++){
   const ov=s.tokens[op][j];if(ov>=0&&ov<51&&(starts[op]+ov)%52===cell){s.tokens[op][j]=-1;captured=true}
  }}
  if(s.tokens[p].every(x=>x===57)){s.done=true;ctx.win('Player '+(p+1)+' wins!')}
  const extra=s.roll===6||captured;s.roll=0;if(!extra&&!s.done)s.turn=(p+1)%s.players;
  ctx.message(captured?'Captured an opponent token!':v===57?'Token reached home!':'Token moved.');ctx.sound('button');save();render();
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
   const token=document.createElement('button');token.className='ludo-piece '+colors[p];token.textContent=v===57?'★':'●';
   token.style.left=`${(c+.5+(pile.length>1?(j%2-.5)*.28:0))/15*100}%`;
   token.style.top=`${(r+.5+(pile.length>2?(Math.floor(j/2)-.5)*.28:0))/15*100}%`;
   token.title='Player '+(p+1)+' token '+(i+1)+(v<0?' (home)':v===57?' (finished)':' (step '+v+')');
   const enabled=p===s.turn&&s.roll&&options(p,s.roll).includes(i)&&!ctx.paused&&!s.done;
   token.disabled=!enabled;if(enabled)token.classList.add('can-move');token.onclick=()=>move(i);board.append(token);
  });ctx.board.append(board);
  ctx.stats.textContent='Player '+(s.turn+1)+' ('+colors[s.turn]+') to play'+(s.roll?' · Rolled '+s.roll:'');ctx.controls.innerHTML='';
  const sel=document.createElement('select');[2,3,4].forEach(n=>sel.add(new Option(n+' players',n)));sel.value=s.players;sel.disabled=s.tokens.some(a=>a.some(v=>v!==-1));
  sel.onchange=()=>{s=fresh(+sel.value);save();render()};const label=document.createElement('label');label.textContent='Players: ';label.append(sel);ctx.controls.append(label);
  const btn=document.createElement('button');btn.className='primary';btn.textContent=s.roll?'Select a glowing token':'🎲 Roll dice';btn.disabled=!!s.roll||s.done;
  btn.onclick=()=>{if(ctx.paused)return;s.roll=1+Math.floor(Math.random()*6);ctx.message('Player '+(s.turn+1)+' rolled '+s.roll);
   if(!options(s.turn,s.roll).length){ctx.message('Rolled '+s.roll+' — no legal moves');s.roll=0;s.turn=(s.turn+1)%s.players}save();render()};ctx.controls.append(btn);
  const tip=document.createElement('p');tip.className='tip';tip.textContent='Traditional cross-shaped Ludo board. Roll 6 to enter; choose a glowing token. Safe squares protect tokens. Reach the center with an exact roll.';ctx.controls.append(tip);
 }render();
}};
