window.PPGames=window.PPGames||{};
PPGames.carrom={init(ctx){
 const W=640,lo=55,hi=585,holes=[[65,65],[575,65],[65,575],[575,575]],R=12,SR=16;
 let timer=null,raf=null,dead=false,aim=null,drag=null,last=0,shot=[],message='',scoreNode=null;
 const modes=[['singles','1 vs 1 · Traditional'],['doubles','2 vs 2 · Traditional'],['free','4 players · Individual Free Mode'],['freeTeams','2 vs 2 · Free Teams']];
 let s=ctx.restore();
 if(!s||!modes.some(m=>m[0]===s.mode)||!Array.isArray(s.seats))s=make('singles');
 function make(mode,seats){const n=mode==='singles'?2:4;return {mode,seats:seats?.slice(0,n)||Array.from({length:n},(_,i)=>i?'computer':'human'),round:1,turn:0,coins:[],balance:Array(n).fill(0),active:Array(n).fill(true),winnings:Array(n).fill(0),queenOwner:-1,pending:-1,done:false,shotCount:0,queenAvailable:true,stakes:0,roundPocketed:[],teamBalance:[0,0]}}
 function free(){return s.mode==='free'||s.mode==='freeTeams'}
 function teams(){return s.mode==='doubles'||s.mode==='freeTeams'}
 function owner(p){return teams()?p%2:p}
 function label(p){return 'P'+(p+1)+(s.seats[p]==='computer'?' 🤖':' 👤')}
 function activePlayers(){return s.active.map((v,i)=>v?i:-1).filter(i=>i>=0)}
 function sound(n){ctx.sound(n)}
 function persist(){ctx.save(s)}
 function initialCoins(){const n=free()?11:9;const cs=[];let id=0;const kinds=Array(n).fill('black').concat(Array(n).fill('white'));if(s.queenAvailable)kinds.push('queen');
  kinds.forEach((kind,i)=>{let a=i*2.39996,rad= i===0?0:Math.sqrt(i)*18;cs.push({id:id++,kind,x:320+Math.cos(a)*rad,y:320+Math.sin(a)*rad,vx:0,vy:0,alive:true})});return cs}
 function nextTurn(){let k=s.turn;for(let i=0;i<s.seats.length;i++){k=(k+1)%s.seats.length;if(s.active[k]){s.turn=k;return}}}
 function boardSetup(){s.coins=initialCoins();s.pending=-1;s.queenOwner=-1;s.shotCount=0;s.roundPocketed=[];s.winnings=Array(s.seats.length).fill(0);s.turn=activePlayers()[0]||0;shot=[];persist();render()}
 function seatSide(p){return s.seats.length===2?p===0?0:2:[0,1,2,3][p]}
 function startPos(p,t=.5){const side=seatSide(p),v=210+220*t;return side===0?{x:v,y:524}:side===1?{x:524,y:v}:side===2?{x:v,y:116}:{x:116,y:v}}
 function safePlace(kind){for(let i=0;i<70;i++){const a=i*2.4,rad=Math.sqrt(i)*15,x=320+Math.cos(a)*rad,y=320+Math.sin(a)*rad;if(s.coins.every(c=>!c.alive||Math.hypot(c.x-x,c.y-y)>R*2+2))return {x,y}}return {x:320,y:320}}
 function restoreCoin(kind){const pos=safePlace(kind);s.coins.push({id:Date.now()+Math.random(),kind,...pos,vx:0,vy:0,alive:true})}
 function coinValue(c){return c.kind==='queen'?50:c.kind==='white'?20:10}
 function matchScore(){return s.mode==='freeTeams'?s.teamBalance:s.balance}
 function setupNextRound(){
  const a=activePlayers();if(a.length<2){finish();return}
  let stake=Math.min(...a.map(p=>s.mode==='freeTeams'?s.teamBalance[p%2]:s.balance[p]));
  if(s.mode==='freeTeams')stake=Math.min(...[0,1].map(t=>s.teamBalance[t]));
  if(stake<=0){finish();return}
  s.stakes=stake;s.round++;s.queenAvailable=stake>=50;
  if(s.mode==='freeTeams'){s.teamBalance=s.teamBalance.map(v=>v-stake);}
  else a.forEach(p=>s.balance[p]-=stake);
  // Rebuild a legal set of 10/20-valued pieces plus a 50-point queen.
  // The queen's 50 points are included in the total stake pool, not added for free.
  const pool=stake*(s.mode==='freeTeams'?2:a.length),q=s.queenAvailable?50:0;
  let rest=pool-q,black=0,white=0;
  while(rest>=20&&white<22){white++;rest-=20}while(rest>=10){black++;rest-=10}
  s.coins=[];let i=0;for(const kind of [...Array(black).fill('black'),...Array(white).fill('white'),...(q?['queen']:[])]){
   const angle=i*2.39996,rad=Math.sqrt(i)*17;s.coins.push({id:i,kind,x:320+Math.cos(angle)*rad,y:320+Math.sin(angle)*rad,vx:0,vy:0,alive:true});i++}
  s.pending=-1;s.queenOwner=-1;s.winnings=Array(s.seats.length).fill(0);s.roundPocketed=[];s.shotCount=0;s.turn=a[0];persist();render();ctx.message('Round '+s.round+' · Each '+(teams()?'team':'player')+' stakes '+stake+' points. '+(q?'Queen is back!':'Queen stays out.'));
 }
 function finish(){s.done=true;const a=activePlayers();let result;if(free()){const vals=s.mode==='freeTeams'?s.teamBalance:s.balance;const max=Math.max(...vals);result='Championship complete! '+(s.mode==='freeTeams'?'Team '+(vals.indexOf(max)+1):'Player '+(vals.indexOf(max)+1))+' wins with '+max+' points.'}else result='Match complete!';ctx.win(result);persist();render()}
 function roundEnd(){if(!free())return finish();
  const a=activePlayers();if(s.round===1){s.balance=s.winnings.slice();if(s.mode==='freeTeams')s.teamBalance=[s.winnings[0]+s.winnings[2],s.winnings[1]+s.winnings[3]];}
  else if(s.mode==='freeTeams'){s.teamBalance[0]+=s.winnings[0]+s.winnings[2];s.teamBalance[1]+=s.winnings[1]+s.winnings[3]}
  else a.forEach(p=>s.balance[p]+=s.winnings[p]);
  if(s.mode==='freeTeams'){for(let p=0;p<4;p++)s.active[p]=s.teamBalance[p%2]>0}
  else for(let p=0;p<4;p++)s.active[p]=s.balance[p]>0;
  if(activePlayers().length<=1||(s.mode==='freeTeams'&&s.teamBalance.filter(x=>x>0).length<=1)){finish();return}
  persist();render();ctx.message('Round '+s.round+' finished. Check balances, then select Next Round.');
 }
 function resolveShot(){
  const p=s.turn,own=owner(p),pocket=shot.filter(x=>x.kind!=='striker'),strikerFoul=shot.some(x=>x.kind==='striker');
  const valid=c=>free()||((own===0&&c.kind==='white')||(own===1&&c.kind==='black'));
  const credited=pocket.filter(c=>c.kind!=='queen'&&valid(c));const wrong=pocket.filter(c=>c.kind!=='queen'&&!valid(c));
  if(!free())wrong.forEach(c=>restoreCoin(c.kind));
  const queen=pocket.some(c=>c.kind==='queen');
  let earned=credited.reduce((v,c)=>v+coinValue(c),0);
  if(queen){if(credited.length&&!strikerFoul){earned+=50;s.queenOwner=p;s.pending=-1;message='Queen covered in the same shot!';sound('carrom-cover')}
   else if(strikerFoul){restoreCoin('queen');message='Striker foul — queen returned.'}
   else {s.pending=p;message='Queen pocketed — cover with a coin on your next shot!';}}
  else if(s.pending===p){if(credited.length&&!strikerFoul){earned+=50;s.queenOwner=p;s.pending=-1;message='Queen successfully covered!';sound('carrom-cover')}
   else{restoreCoin('queen');s.pending=-1;message='Queen not covered — returned to the board.'}}
  if(strikerFoul){if(credited.length)credited.forEach(c=>restoreCoin(c.kind));earned=0;
   const prior=s.winnings[p];if(prior>=10){s.winnings[p]-=10;restoreCoin(free()?'black':own===0?'white':'black')}
   message='Striker pocketed — foul!';sound('carrom-foul');}
  else s.winnings[p]+=earned;
  s.roundPocketed.push(...pocket.map(c=>c.kind));
  const left=s.coins.filter(c=>c.alive&&c.kind!=='queen');const queenLeft=s.coins.some(c=>c.alive&&c.kind==='queen');
  if(!left.length){
   if(s.pending>=0){restoreCoin('queen');restoreCoin(free()?'black':own===0?'white':'black');s.pending=-1;message='Queen must be covered; a coin has been returned.'}
   else if(queenLeft){restoreCoin(free()?'black':own===0?'white':'black');message='The queen must be covered before the board ends.'}
   else{roundEnd();return}
  }
  if(!free()&&s.queenOwner>=0){const target=owner(s.queenOwner)===0?'white':'black';if(!s.coins.some(c=>c.alive&&c.kind===target)){finish();return}}
  if(!s.done){if(strikerFoul||(!credited.length&&!queen))nextTurn();persist();render();ctx.message(message||('Player '+(p+1)+' pocketed '+credited.length+' coin(s).'))}
 }
 const wrapper=document.createElement('div');wrapper.className='carrom-wrap';const canvas=document.createElement('canvas');canvas.width=W;canvas.height=W;canvas.className='carrom-canvas';canvas.setAttribute('aria-label','Interactive Carrom board');wrapper.append(canvas);ctx.board.append(wrapper);const g=canvas.getContext('2d');
 function paint(){g.clearRect(0,0,W,W);g.fillStyle='#99562c';g.fillRect(0,0,W,W);g.fillStyle='#e7cb94';g.fillRect(42,42,556,556);g.strokeStyle='#9d4f2d';g.lineWidth=3;g.strokeRect(55,55,530,530);
  g.strokeStyle='#a55e3c';g.lineWidth=2;g.beginPath();g.arc(320,320,63,0,Math.PI*2);g.stroke();g.beginPath();g.arc(320,320,19,0,Math.PI*2);g.stroke();
  for(const side of [0,1,2,3]){g.save();g.translate(320,320);g.rotate(side*Math.PI/2);g.strokeStyle='#a64e38';g.lineWidth=3;g.beginPath();g.moveTo(-110,192);g.lineTo(110,192);g.moveTo(-110,220);g.lineTo(110,220);g.stroke();g.restore()}
  holes.forEach(([x,y])=>{g.beginPath();g.arc(x,y,23,0,Math.PI*2);g.fillStyle='#30201b';g.fill();g.strokeStyle='#86502b';g.lineWidth=4;g.stroke()});
  for(const c of s.coins){if(!c.alive)continue;g.beginPath();g.arc(c.x,c.y,R,0,Math.PI*2);g.fillStyle=c.kind==='queen'?'#c52d37':c.kind==='white'?'#fff1d6':'#26272c';g.fill();g.lineWidth=2;g.strokeStyle=c.kind==='white'?'#ad9875':'#c6a777';g.stroke();g.beginPath();g.arc(c.x,c.y,7,0,Math.PI*2);g.lineWidth=1;g.stroke()}
  if(animating&&striker&&striker.alive){g.beginPath();g.arc(striker.x,striker.y,SR,0,Math.PI*2);g.fillStyle='#f9e2aa';g.fill();g.lineWidth=3;g.strokeStyle='#99502e';g.stroke();g.beginPath();g.arc(striker.x,striker.y,9,0,Math.PI*2);g.strokeStyle='#c38c51';g.lineWidth=2;g.stroke()}
  if(!s.done&&s.coins.some(c=>c.alive)&&!animating){const pos=startPos(s.turn,aim?.t??.5);g.beginPath();g.arc(pos.x,pos.y,SR,0,Math.PI*2);g.fillStyle='#f9e2aa';g.fill();g.strokeStyle='#99502e';g.lineWidth=3;g.stroke();if(drag&&s.seats[s.turn]==='human'){const dx=pos.x-drag.x,dy=pos.y-drag.y;g.beginPath();g.moveTo(pos.x,pos.y);g.lineTo(pos.x+dx*1.4,pos.y+dy*1.4);g.strokeStyle='#2d8f7d';g.lineWidth=4;g.stroke()}}
 }
 let animating=false,striker=null,pocketed=[];
 function simulate(dt){const objs=s.coins.filter(c=>c.alive).concat(striker&&striker.alive?[striker]:[]);const step=Math.min(dt,2);
  for(const o of objs){o.x+=o.vx*step;o.y+=o.vy*step;o.vx*=Math.pow(.983,step);o.vy*=Math.pow(.983,step);if(Math.abs(o.vx)<.04)o.vx=0;if(Math.abs(o.vy)<.04)o.vy=0;
   if(holes.some(([x,y])=>Math.hypot(o.x-x,o.y-y)<20)){o.alive=false;pocketed.push(o===striker?{kind:'striker'}:{kind:o.kind});updateScores();sound(o===striker?'carrom-foul':o.kind==='queen'?'carrom-queen':'carrom-pocket');continue}
   const r=o===striker?SR:R;for(const axis of ['x','y']){if(o[axis]<lo+r){o[axis]=lo+r;o['v'+axis]=Math.abs(o['v'+axis])*.76;sound('carrom-wall')}if(o[axis]>hi-r){o[axis]=hi-r;o['v'+axis]=-Math.abs(o['v'+axis])*.76;sound('carrom-wall')}}}
  for(let i=0;i<objs.length;i++)for(let j=i+1;j<objs.length;j++){const a=objs[i],b=objs[j];if(!a.alive||!b.alive)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001,min=(a===striker?SR:R)+(b===striker?SR:R);if(d>=min)continue;
   const nx=dx/d,ny=dy/d,over=(min-d)/2;a.x-=nx*over;b.x+=nx*over;a.y-=ny*over;b.y+=ny*over;
   const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){const impulse=-rel*.88;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;if(Math.abs(rel)>1)sound('carrom-collision')}}
  return objs.some(o=>o.alive&&(Math.abs(o.vx)+Math.abs(o.vy)>.1))}
 function animate(ts){if(dead)return;if(ctx.paused){raf=requestAnimationFrame(animate);last=ts;return}const dt=Math.min(2.5,(ts-last)/16.67||1);last=ts;let moving=false;for(let i=0;i<2;i++)moving=simulate(dt/2)||moving;paint();updateScores();if(moving)raf=requestAnimationFrame(animate);else{animating=false;shot=pocketed.slice();striker=null;pocketed=[];resolveShot();scheduleAI()}}
 function shoot(x,y,power){if(animating||s.done||ctx.paused)return;const pos=startPos(s.turn,aim?.t??.5);striker={kind:'striker',...pos,vx:x*power,vy:y*power,alive:true};animating=true;pocketed=[];s.shotCount++;sound('carrom-strike');last=performance.now();raf=requestAnimationFrame(animate);render()}
 function point(e){const rect=canvas.getBoundingClientRect();return {x:(e.clientX-rect.left)*640/rect.width,y:(e.clientY-rect.top)*640/rect.height}}
 canvas.addEventListener('pointerdown',e=>{if(animating||s.done||ctx.paused||s.seats[s.turn]!=='human')return;const p=point(e),side=seatSide(s.turn);if(!aim)aim={t:.5};if(side%2===0)aim.t=Math.max(0,Math.min(1,(p.x-210)/220));else aim.t=Math.max(0,Math.min(1,(p.y-210)/220));drag=p;canvas.setPointerCapture(e.pointerId);paint()});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;drag=point(e);paint()});
 canvas.addEventListener('pointerup',e=>{if(!drag)return;const pos=startPos(s.turn,aim?.t??.5),p=point(e);drag=null;let dx=pos.x-p.x,dy=pos.y-p.y,len=Math.hypot(dx,dy);if(len<12){paint();return}shoot(dx/len,dy/len,Math.min(16,Math.max(3,len/13)))});
 function aiShot(){if(dead||!ctx.active()||s.done||animating||s.seats[s.turn]!=='computer')return;if(ctx.paused){scheduleAI();return}const p=s.turn,side=seatSide(p),targets=s.coins.filter(c=>c.alive&&c.kind!=='queen');if(s.pending===p||!targets.length)targets.push(...s.coins.filter(c=>c.alive&&c.kind==='queen'));
  if(!targets.length)return;const target=targets[Math.floor(Math.random()*Math.min(targets.length,4))];let best=null;
  for(let t=0;t<=10;t++){const pos=startPos(p,t/10),dx=target.x-pos.x,dy=target.y-pos.y,dist=Math.hypot(dx,dy);if(!dist)continue;const score=dist+(side%2===0?Math.abs(dx)*.03:Math.abs(dy)*.03);if(!best||score<best.score)best={t:t/10,dx,dy,dist,score}}
  aim={t:best.t};let error=ctx.difficulty==='easy'?.24:ctx.difficulty==='medium'?.10:.025;let angle=Math.atan2(best.dy,best.dx)+(Math.random()-.5)*error;shoot(Math.cos(angle),Math.sin(angle),Math.min(15,Math.max(5,best.dist/35)));}
 function scheduleAI(){clearTimeout(timer);if(dead||s.done||animating||!ctx.active()||s.seats[s.turn]!=='computer')return;timer=setTimeout(aiShot,850)}
 function updateScores(){
  if(!scoreNode)return;
  const pending=Array(s.seats.length).fill(0);
  if(animating&&!pocketed.some(c=>c.kind==='striker')){
   for(const c of pocketed){if(c.kind==='queen')continue;
    if(free()||(owner(s.turn)===0&&c.kind==='white')||(owner(s.turn)===1&&c.kind==='black'))pending[s.turn]+=coinValue(c);
   }
  }
  const names=s.seats.map((_,i)=>'P'+(i+1)+' ('+['Red','Blue','Yellow','Green'][i]+')');
  const round=teams()?[0,1].map(team=>{let total=0,preview=0;for(let i=team;i<s.seats.length;i+=2){total+=s.winnings[i];preview+=pending[i]}return 'Team '+(team?'B':'A')+': '+total+(preview?' (+'+preview+' pocketed)':'')}).join(' | '):names.map((n,i)=>n+': '+s.winnings[i]+(pending[i]?' (+'+pending[i]+' pocketed)':'')).join(' | ');
  const balances=free()?(s.mode==='freeTeams'?s.teamBalance.map((v,i)=>'Team '+(i?'B':'A')+': '+v).join(' | '):s.balance.map((v,i)=>'P'+(i+1)+': '+v).join(' | ')):'Not applicable in traditional mode';
  scoreNode.textContent='Round '+s.round+' points: '+round+' · Championship balances: '+balances;
 }
 function render(){if(dead)return;paint();ctx.stats.textContent='Round '+s.round+' · '+label(s.turn)+(teams()?' · Team '+(s.turn%2===0?'A':'B'):'')+' · '+(free()?'Balances: '+(s.mode==='freeTeams'?s.teamBalance.map((v,i)=>'Team '+(i?'B':'A')+' '+v).join(' | '):s.balance.map((v,i)=>'P'+(i+1)+' '+v).join(' | ')):'Coins left: '+s.coins.filter(c=>c.alive).length);
  ctx.controls.innerHTML='';scoreNode=document.createElement('div');scoreNode.className='carrom-live-score';scoreNode.setAttribute('aria-live','polite');ctx.controls.append(scoreNode);updateScores();const top=document.createElement('div');top.className='carrom-settings';
  const ml=document.createElement('label');ml.textContent='Match: ';const ms=document.createElement('select');modes.forEach(([v,n])=>ms.add(new Option(n,v)));ms.value=s.mode;ms.disabled=s.shotCount>0||s.round>1;ms.onchange=()=>{s=make(ms.value);boardSetup();scheduleAI()};ml.append(ms);top.append(ml);
  for(let i=0;i<s.seats.length;i++){const l=document.createElement('label');l.textContent='P'+(i+1)+': ';const select=document.createElement('select');select.add(new Option('Human','human'));select.add(new Option('Computer','computer'));select.value=s.seats[i];select.disabled=s.shotCount>0||s.round>1;select.onchange=()=>{s.seats[i]=select.value;persist();render();scheduleAI()};l.append(select);top.append(l)}ctx.controls.append(top);
  const desc=document.createElement('p');desc.className='tip';desc.textContent=free()?'Free championship: black 10, white 20, queen 50 (cover required). Each active '+(teams()?'team':'player')+' stakes the lowest balance next round. Zero balance means elimination.':'Traditional color rules: '+(teams()?'Team A white, Team B black.':'P1 white, P2 black.')+' Pocket the queen and cover it with your own color.';ctx.controls.append(desc);
  const help=document.createElement('p');help.className='tip';help.textContent='Drag backward from your striker to aim and set power. To reposition, press near your preferred baseline spot before dragging. Computer shots run automatically.';ctx.controls.append(help);
  if(free()&&s.coins.every(c=>!c.alive)&&!s.done){const next=document.createElement('button');next.className='primary';next.textContent='Start Round '+(s.round+1);next.onclick=()=>{setupNextRound();scheduleAI()};ctx.controls.append(next)}
  if(s.done){const b=document.createElement('strong');b.textContent='Match complete';ctx.controls.append(b)}
 }
 boardSetup();scheduleAI();return ()=>{dead=true;clearTimeout(timer);cancelAnimationFrame(raf)};
}};
