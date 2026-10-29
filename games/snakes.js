window.PPGames=window.PPGames||{};
PPGames.snakes={init(ctx){
 const jumps={4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91,17:7,54:34,62:19,64:60,87:24,93:73,95:75,98:79};
 const colors=['#e83e58','#3288e8','#16a86b','#e5a300'];
 let s=ctx.restore();if(!s||!Array.isArray(s.pos))s={pos:[0,0],turn:0,players:2,done:false};
 const xy=n=>{const row=Math.floor((n-1)/10),col=row%2===0?(n-1)%10:9-(n-1)%10;return [(col+.5)*10,(9-row+.5)*10]};
 function save(){ctx.save(s)}
 function render(){
  ctx.board.innerHTML='';const wrap=document.createElement('div');wrap.className='snake-board',grid=document.createElement('div');grid.className='snake-grid';
  for(let row=9;row>=0;row--)for(let col=0;col<10;col++){
   const n=row*10+(row%2===0?col+1:10-col),cell=document.createElement('div');cell.className='snake-cell';cell.textContent=n;
   if(jumps[n])cell.title=(jumps[n]>n?'Ladder to ':'Snake to ')+jumps[n];
   const players=s.pos.map((v,i)=>v===n?i:-1).filter(i=>i>=0);
   if(players.length){const dots=document.createElement('span');dots.className='snake-pieces';players.forEach(i=>{const dot=document.createElement('i');dot.style.background=colors[i];dots.append(dot)});cell.append(dots)}grid.append(cell);
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
  });wrap.append(svg);ctx.board.append(wrap);
  ctx.stats.textContent='Turn: Player '+(s.turn+1)+' · '+s.pos.map((v,i)=>'P'+(i+1)+': '+v).join(' · ');ctx.controls.innerHTML='';
  const select=document.createElement('select');[2,3,4].forEach(n=>select.add(new Option(n+' players',n)));select.value=s.players;select.disabled=s.pos.some(Boolean);
  select.onchange=()=>{s={pos:Array(+select.value).fill(0),turn:0,players:+select.value,done:false};save();render()};
  const label=document.createElement('label');label.textContent='Players: ';label.append(select);ctx.controls.append(label);
  const btn=document.createElement('button');btn.className='primary';btn.textContent='🎲 Roll dice';btn.disabled=s.done;
  btn.onclick=()=>{if(ctx.paused||s.done)return;const d=1+Math.floor(Math.random()*6),p=s.turn;let v=s.pos[p],msg='Player '+(p+1)+' rolled '+d;
   if(v+d<=100){v+=d;if(jumps[v]){msg+=jumps[v]>v?' — climbed a ladder!':' — slid down a snake!';v=jumps[v]}s.pos[p]=v}else msg+=' — exact roll needed';
   if(v===100){s.done=true;msg+=' — wins!';ctx.win('Player '+(p+1)+' wins!')}else s.turn=(s.turn+1)%s.players;
   ctx.message(msg);ctx.sound('button');save();render()};ctx.controls.append(btn);
  const tip=document.createElement('p');tip.className='tip';tip.textContent='🪜 Climb illustrated ladders; 🐍 slide down snakes. Reach 100 with an exact roll.';ctx.controls.append(tip);
 }render();
}};
