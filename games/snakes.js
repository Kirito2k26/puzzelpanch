window.PPGames=window.PPGames||{};
PPGames.snakes={init(ctx){
 const jumps={4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91,17:7,54:34,62:19,64:60,87:24,93:73,95:75,98:79};
 const colors=['#e83e58','#3288e8','#16a86b','#e5a300'];
 let s=ctx.restore();if(!s||!Array.isArray(s.pos))s=fresh(2);
 s.types=Array.isArray(s.types)&&s.types.length===s.players?s.types:Array(s.players).fill('human');
 let aiTimer=null,moveTimer=null,moving=false;
 function fresh(n,types){return {pos:Array(n).fill(0),turn:0,players:n,done:false,types:types||Array(n).fill('human')}}
 function name(p){return 'Player '+(p+1)+(s.types[p]==='computer'?' (Computer)':' (Human)')}
 function scheduleAI(){clearTimeout(aiTimer);
  if(!ctx.active()||s.done||moving||s.types[s.turn]!=='computer')return;
  aiTimer=setTimeout(()=>{if(!ctx.active()||s.done)return;if(ctx.paused){scheduleAI();return}roll()},750);
 }
 function roll(){
  if(ctx.paused||s.done||moving)return;
  const d=1+Math.floor(Math.random()*6),p=s.turn,origin=s.pos[p];let msg=name(p)+' rolled '+d;
  if(origin+d>100){ctx.message(msg+' — exact roll needed');s.turn=(p+1)%s.players;save();render();return}
  moving=true;clearTimeout(aiTimer);let step=0;
  function advance(){
   if(!ctx.active()){moving=false;return}
   if(ctx.paused){moveTimer=setTimeout(advance,100);return}
   step++;s.pos[p]=origin+step;ctx.sound('move');render();
   if(step<d){moveTimer=setTimeout(advance,250);return}
   const landed=s.pos[p],destination=jumps[landed];
   if(destination){msg+=destination>landed?' — climbed a ladder!':' — slid down a snake!';moveTimer=setTimeout(()=>{if(ctx.paused){moveTimer=setTimeout(()=>complete(destination),100);return}complete(destination)},350)}
   else complete(landed);
  }
  function complete(v){if(ctx.paused){moveTimer=setTimeout(()=>complete(v),100);return}
   s.pos[p]=v;if(v===100){s.done=true;msg+=' — wins!';ctx.win(name(p)+' wins!')}else s.turn=(s.turn+1)%s.players;
   moving=false;ctx.message(msg);ctx.sound('button');save();render();
  }
  advance();
 }
 const xy=n=>{const row=Math.floor((n-1)/10),col=row%2===0?(n-1)%10:9-(n-1)%10;return [(col+.5)*10,(9-row+.5)*10]};
 function save(){ctx.save(s)}
 function render(){
  ctx.board.innerHTML='';const wrap=document.createElement('div');wrap.className='snake-board';const grid=document.createElement('div');grid.className='snake-grid';
  for(let row=9;row>=0;row--)for(let col=0;col<10;col++){
   const n=row*10+(row%2===0?col+1:10-col),cell=document.createElement('div');cell.className='snake-cell';cell.textContent=n;if(n===1||n===100){cell.classList.add(n===1?'snake-start':'snake-finish');const tag=document.createElement('b');tag.textContent=n===1?'START':'WIN';cell.append(tag);}
   if(jumps[n])cell.title=(jumps[n]>n?'Ladder to ':'Snake to ')+jumps[n];
   const players=s.pos.map((v,i)=>v===n?i:-1).filter(i=>i>=0);
   if(players.length){const dots=document.createElement('span');dots.className='snake-pieces';players.forEach(i=>{const dot=document.createElement('i');dot.style.background=colors[i];dot.textContent=i+1;dot.title=name(i);if(i===s.turn)dot.classList.add('active');dots.append(dot)});cell.append(dots)}grid.append(cell);
  }
  wrap.append(grid);
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('class','snake-art');svg.setAttribute('aria-label','Illustrated snakes and ladders');
  const el=(tag,attrs)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};
  Object.entries(jumps).forEach(([from,to],i)=>{
   const [x1,y1]=xy(+from),[x2,y2]=xy(to);
   if(to>from){const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),nx=-dy/len*1.05,ny=dx/len*1.05;
    for(const k of [-1,1])svg.append(el('line',{x1:x1+nx*k,y1:y1+ny*k,x2:x2+nx*k,y2:y2+ny*k,stroke:'#85491d','stroke-width':'.75','stroke-linecap':'round'}));
    for(let j=1,count=Math.max(3,Math.floor(len/3));j<count;j++){const t=j/count,x=x1+dx*t,y=y1+dy*t;svg.append(el('line',{x1:x-nx*1.25,y1:y-ny*1.25,x2:x+nx*1.25,y2:y+ny*1.25,stroke:'#efc57a','stroke-width':'.65','stroke-linecap':'round'}))}
   }else{const cx=(x1+x2)/2+(i%2?8:-8),cy=(y1+y2)/2+((i%3)-1)*6;
    svg.append(el('path',{d:`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,fill:'none',stroke:'#fff8d8','stroke-width':'2.5','stroke-linecap':'round'}));
    svg.append(el('path',{d:`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,fill:'none',stroke:i%2?'#c94477':'#399c65','stroke-width':'1.6','stroke-linecap':'round'}));
    svg.append(el('circle',{cx:x1,cy:y1,r:'1.7',fill:i%2?'#c94477':'#399c65',stroke:'#fff','stroke-width':'.4'}));
    for(const dx of [-.5,.5])svg.append(el('circle',{cx:x1+dx,cy:y1-.4,r:'.2',fill:'#fff'}));
   }
  });wrap.append(svg);const layout=document.createElement('div');layout.className='snake-layout';layout.append(wrap);const home=document.createElement('div');home.className='snake-home';home.innerHTML='<strong>HOME · Waiting to start</strong>';s.pos.forEach((v,i)=>{const slot=document.createElement('span');slot.className='snake-home-slot';slot.style.setProperty('--coin',colors[i]);slot.textContent=v===0?String(i+1):'–';slot.title=name(i);if(v===0)slot.classList.add('occupied');if(i===s.turn)slot.classList.add('active');home.append(slot)});layout.append(home);ctx.board.append(layout);
  ctx.stats.textContent='Turn: '+name(s.turn)+' · '+s.pos.map((v,i)=>['Red','Blue','Green','Yellow'][i]+': '+v).join(' · ');ctx.controls.innerHTML='';
  const started=s.pos.some(Boolean);
  const select=document.createElement('select');[2,3,4].forEach(n=>select.add(new Option(n+' players',n)));select.value=s.players;select.disabled=started;
  select.onchange=()=>{s=fresh(+select.value);save();render()};
  const label=document.createElement('label');label.textContent='Players: ';label.append(select);ctx.controls.append(label);
  const setup=document.createElement('div');setup.className='ai-seat-setup';
  for(let p=0;p<s.players;p++){
   const seat=document.createElement('label');seat.className='ai-seat';
   const nameTag=document.createElement('span');nameTag.textContent=['Red','Blue','Green','Yellow'][p]+' player';
   const type=document.createElement('select');type.setAttribute('aria-label','Player '+(p+1)+' type');
   type.add(new Option('Human','human'));type.add(new Option('Computer','computer'));
   type.value=s.types[p];type.disabled=started;
   type.onchange=()=>{s.types[p]=type.value;save();render()};
   seat.append(nameTag,type);setup.append(seat);
  }
  ctx.controls.append(setup);
  const btn=document.createElement('button');btn.className='primary';btn.textContent='🎲 Roll dice';
  btn.disabled=s.done||moving||s.types[s.turn]==='computer';btn.onclick=roll;ctx.controls.prepend(btn);
  if(s.types[s.turn]==='computer'&&!s.done){const waiting=document.createElement('span');waiting.className='ai-waiting';waiting.textContent='🤖 '+name(s.turn)+' is rolling…';ctx.controls.append(waiting)}
  if(!moving)scheduleAI();
  const tip=document.createElement('p');tip.className='tip';tip.textContent='🪜 Climb illustrated ladders; 🐍 slide down snakes. Reach 100 with an exact roll.';ctx.controls.append(tip);
 }render();return ()=>{clearTimeout(aiTimer);clearTimeout(moveTimer)};
}};
