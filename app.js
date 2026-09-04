(()=>{
const $=s=>document.querySelector(s), canvas=$('#c'),ctx=canvas.getContext('2d');
let W=80,H=60, objects=[],selected=null,placeType=null,routeMode=false,route=[],view='3d',drag=null,orbitDrag=null;
let yaw=-32*Math.PI/180,pitch=48*Math.PI/180,zoom=10,anim=false,progress=0,last=performance.now(),showGrid=true,showShadows=true;
const colors={Vertical:'#f7f3e8',Oxer:'#f6bd60',Muro:'#e76f51',Liverpool:'#48cae4',Triple:'#90be6d',Doble:'#c77dff'};
function resize(){let r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);draw()}
addEventListener('resize',resize);
function project(x,y,z=0){
 const r=canvas.getBoundingClientRect(),cx=r.width/2,cy=r.height/2;
 if(view==='top'){let s=Math.min(r.width/(W+12),r.height/(H+12))*zoom/10;return {x:cx+(x-W/2)*s,y:cy+(y-H/2)*s-z*s,s}}
 let X=x-W/2,Y=y-H/2; let ca=Math.cos(yaw),sa=Math.sin(yaw);
 let xr=X*ca-Y*sa, yr=X*sa+Y*ca;
 let cp=Math.cos(pitch),sp=Math.sin(pitch); let yp=yr*sp-z*cp, depth=yr*cp+z*sp;
 let s=Math.min(r.width/(W+15),r.height/(H+20))*zoom/10; let persp=1/(1+depth/180);
 return {x:cx+xr*s*persp,y:cy+yp*s*persp+25,s:s*persp,depth}
}
function groundPoly(){
 let pts=[[0,0],[W,0],[W,H],[0,H]].map(p=>project(...p));
 ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle='#b88f63';ctx.fill();ctx.strokeStyle='#d9b68e';ctx.lineWidth=2;ctx.stroke();
 if(showGrid){ctx.save();ctx.strokeStyle='#ffffff18';ctx.lineWidth=1;for(let x=0;x<=W;x+=5){let a=project(x,0),b=project(x,H);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}for(let y=0;y<=H;y+=5){let a=project(0,y),b=project(W,y);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore()}
}
function drawJump(o){
 let p=project(o.x,o.y,0), rad=o.rot*Math.PI/180,dx=Math.cos(rad)*o.width/2,dy=Math.sin(rad)*o.width/2;
 let a=project(o.x-dx,o.y-dy,0),b=project(o.x+dx,o.y+dy,0),at=project(o.x-dx,o.y-dy,o.height),bt=project(o.x+dx,o.y+dy,o.height);
 if(showShadows&&view==='3d'){ctx.strokeStyle='#0004';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(a.x+8,a.y+5);ctx.lineTo(b.x+8,b.y+5);ctx.stroke()}
 ctx.strokeStyle=colors[o.type]||'#fff';ctx.lineWidth=Math.max(3,p.s*.22);
 ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(at.x,at.y);ctx.moveTo(b.x,b.y);ctx.lineTo(bt.x,bt.y);ctx.moveTo(at.x,at.y);ctx.lineTo(bt.x,bt.y);ctx.stroke();
 if(o.type==='Oxer'||o.type==='Triple'||o.type==='Doble'){let off=.9,px=-Math.sin(rad)*off,py=Math.cos(rad)*off;let c=project(o.x-dx+px,o.y-dy+py,o.height*.85),d=project(o.x+dx+px,o.y+dy+py,o.height*.85);ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke()}
 if(o.type==='Muro'){ctx.fillStyle=colors[o.type]+'bb';let base1=project(o.x-dx,o.y-dy,0),base2=project(o.x+dx,o.y+dy,0);ctx.beginPath();ctx.moveTo(base1.x,base1.y);ctx.lineTo(base2.x,base2.y);ctx.lineTo(bt.x,bt.y);ctx.lineTo(at.x,at.y);ctx.closePath();ctx.fill()}
 if(o.type==='Liverpool'){ctx.fillStyle='#249dd0aa';let rr=Math.max(8,p.s*1.1);ctx.fillRect(p.x-rr,p.y-rr*.3,rr*2,rr*.6)}
 ctx.fillStyle=o===selected?'#ffd166':'#07111f';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y-16,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=o===selected?'#07111f':'#fff';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.num||'?',p.x,p.y-16);
 if(o===selected){ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.stroke()}
}
function routePoints(){return route.map(id=>objects.find(o=>o.id===id)).filter(Boolean)}
function catmull(points,steps=14){
 if(points.length<2)return points.map(o=>({x:o.x,y:o.y}));
 let out=[];for(let i=0;i<points.length-1;i++){let p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  for(let j=0;j<steps;j++){let t=j/steps,t2=t*t,t3=t2*t;out.push({x:.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),y:.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)})}}
 out.push({x:points[points.length-1].x,y:points[points.length-1].y});return out
}
function drawRoute(){
 let pts=catmull(routePoints());if(pts.length<2)return;
 let projected=pts.map(p=>project(p.x,p.y,.08));
 ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle='#e8f5ff99';ctx.lineWidth=3;ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
 let n=Math.max(2,Math.floor(projected.length*(anim?progress:1)));ctx.strokeStyle='#ef476f';ctx.shadowColor='#ef476f';ctx.shadowBlur=12;ctx.lineWidth=8;ctx.beginPath();projected.slice(0,n).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.shadowBlur=0;
 if(n>2){let a=projected[n-2],b=projected[n-1],ang=Math.atan2(b.y-a.y,b.x-a.x);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(ang);ctx.fillStyle='#ffd166';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-8,-7);ctx.lineTo(-5,0);ctx.lineTo(-8,7);ctx.closePath();ctx.fill();ctx.restore()}
}
function draw(){
 let r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);
 let g=ctx.createLinearGradient(0,0,0,r.height);g.addColorStop(0,'#8fc5df');g.addColorStop(.45,'#d7e7e8');g.addColorStop(.46,'#365d3e');g.addColorStop(1,'#17311f');ctx.fillStyle=g;ctx.fillRect(0,0,r.width,r.height);
 groundPoly();drawRoute();
 let sorted=[...objects].sort((a,b)=>(project(a.x,a.y).depth||0)-(project(b.x,b.y).depth||0));sorted.forEach(drawJump);
}
function unproject(sx,sy){
 let r=canvas.getBoundingClientRect();
 if(view==='top'){let s=Math.min(r.width/(W+12),r.height/(H+12))*zoom/10;return{x:(sx-r.width/2)/s+W/2,y:(sy-r.height/2)/s+H/2}}
 // numerical inverse on ground via coarse affine approximation using basis vectors
 let o=project(0,0),px=project(1,0),py=project(0,1),ax=px.x-o.x,ay=px.y-o.y,bx=py.x-o.x,by=py.y-o.y,dx=sx-o.x,dy=sy-o.y,det=ax*by-ay*bx;
 return{x:(dx*by-dy*bx)/det,y:(ax*dy-ay*dx)/det}
}
function hit(sx,sy){let best=null,bd=28;objects.forEach(o=>{let p=project(o.x,o.y);let d=Math.hypot(p.x-sx,p.y-sy);if(d<bd){best=o;bd=d}});return best}
function pointerPos(e){let r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);let q=pointerPos(e),h=hit(q.x,q.y);
 if(placeType){let p=unproject(q.x,q.y);addObject(placeType,p.x,p.y);placeType=null;setMode('seleccionar');return}
 if(routeMode&&h){if(!route.includes(h.id))route.push(h.id);updateUI();draw();return}
 if(h){selected=h;drag={o:h};updateUI();draw()}else if(view==='3d'){orbitDrag={x:e.clientX,y:e.clientY,yaw,pitch}}});
canvas.addEventListener('pointermove',e=>{let q=pointerPos(e);if(drag){let p=unproject(q.x,q.y);drag.o.x=Math.max(0,Math.min(W,p.x));drag.o.y=Math.max(0,Math.min(H,p.y));draw()}else if(orbitDrag){yaw=orbitDrag.yaw+(e.clientX-orbitDrag.x)*.008;pitch=Math.max(.2,Math.min(1.35,orbitDrag.pitch+(e.clientY-orbitDrag.y)*.006));$('#yaw').value=yaw*180/Math.PI;$('#pitch').value=pitch*180/Math.PI;draw()}});
canvas.addEventListener('pointerup',()=>{drag=null;orbitDrag=null;updateInspector()});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(5,Math.min(18,zoom-e.deltaY*.01));$('#zoom').value=zoom;draw()},{passive:false});
function addObject(type,x=W/2,y=H/2){let o={id:'p3d_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2),type,x,y,rot:0,height:type==='Muro'?1.5:1.4,width:type==='Oxer'?2.0:1.8,num:String(objects.length+1)};objects.push(o);selected=o;updateUI();draw()}
function setMode(s){$('#modePill').textContent='Modo: '+s}
function updateInspector(){let on=!!selected;$('#inspector').style.display=on?'block':'none';$('#emptyInspector').style.display=on?'none':'block';if(!on)return;$('#iType').value=selected.type;$('#iNum').value=selected.num;$('#iRot').value=selected.rot;$('#iHeight').value=selected.height;$('#iWidth').value=selected.width}
function updateUI(){W=+$ ('#arenaW').value||80;H=+$('#arenaH').value||60;$('#countPill').textContent=objects.length+' obstáculos';updateInspector();let box=$('#routeList');box.innerHTML='';routePoints().forEach((o,i)=>{let d=document.createElement('div');d.className='item';d.innerHTML=`<span class="badge">${i+1}</span><span>${o.num} · ${o.type}</span>`;box.appendChild(d)})}
document.querySelectorAll('.jump').forEach(b=>b.onclick=()=>{placeType=b.dataset.type;routeMode=false;$('#routeMode').classList.remove('active');setMode('colocar '+placeType);$('#leftPanel').classList.remove('show')});
$('#routeMode').onclick=()=>{routeMode=!routeMode;placeType=null;$('#routeMode').classList.toggle('active',routeMode);setMode(routeMode?'definir recorrido':'seleccionar')};
$('#clearRoute').onclick=()=>{route=[];updateUI();draw()};
$('#viewTop').onclick=()=>{view='top';$('#camPill').textContent='Cámara: cenital';draw()};
$('#view3d').onclick=()=>{view='3d';$('#camPill').textContent='Cámara: 3D';draw()};
$('#play').onclick=()=>{if(route.length<2){status('Define al menos 2 obstáculos en el recorrido');return}anim=true;progress=0;$('#play').textContent='⏸ Reproduciendo';};
function status(t){$('#status').textContent='● '+t;setTimeout(function(){ $('#status').textContent='● JavaScript ACTIVO'; },2200)}
$('#testJS').onclick=function(){
  document.body.style.outline='6px solid #57e389';
  $('#status').textContent='● JavaScript ACTIVO — TEST CORRECTO';
  $('#modePill').textContent='TEST: controles funcionando';
  setTimeout(function(){document.body.style.outline='none';},1200);
};
['arenaW','arenaH'].forEach(id=>$('#'+id).oninput=()=>{updateUI();draw()});
[['iType','type'],['iNum','num'],['iRot','rot'],['iHeight','height'],['iWidth','width']].forEach(([id,k])=>$('#'+id).oninput=e=>{if(selected){selected[k]=(k==='type'||k==='num')?e.target.value:+e.target.value;updateUI();draw()}});
$('#delete').onclick=()=>{if(!selected)return;objects=objects.filter(o=>o!==selected);route=route.filter(id=>id!==selected.id);selected=null;updateUI();draw()};
$('#duplicate').onclick=()=>{if(!selected)return;let o={...selected,id:'p3d_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2),x:selected.x+3,y:selected.y+3,num:String(objects.length+1)};objects.push(o);selected=o;updateUI();draw()};
$('#pitch').oninput=e=>{pitch=+e.target.value*Math.PI/180;draw()};$('#yaw').oninput=e=>{yaw=+e.target.value*Math.PI/180;draw()};$('#zoom').oninput=e=>{zoom=+e.target.value;draw()};
$('#grid').onchange=e=>{showGrid=e.target.checked;draw()};$('#shadows').onchange=e=>{showShadows=e.target.checked;draw()};
$('#saveBtn').onclick=()=>{let data={version:'0.3',arena:{width:W,length:H},objects,route};let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='faas_equestrian_course.json';a.click();URL.revokeObjectURL(a.href);status('Proyecto guardado')};
$('#loadBtn').onclick=()=>$('#fileInput').click();$('#fileInput').onchange=async e=>{try{let data=JSON.parse(await e.target.files[0].text());objects=data.objects||[];route=data.route||[];W=data.arena?.width||80;H=data.arena?.length||60;$('#arenaW').value=W;$('#arenaH').value=H;selected=null;updateUI();draw();status('Proyecto abierto')}catch{status('No se pudo abrir el JSON')}};
$('#demoBtn').onclick=()=>{objects=[];route=[];let demo=[['Vertical',12,16,20],['Oxer',27,10,-15],['Vertical',43,18,40],['Doble',61,12,85],['Muro',67,34,10],['Oxer',48,47,-30],['Liverpool',27,42,70],['Triple',12,49,5]];demo.forEach((d,i)=>{addObject(d[0],d[1],d[2]);objects[objects.length-1].rot=d[3];objects[objects.length-1].num=String(i+1);route.push(objects[objects.length-1].id)});selected=null;updateUI();draw();status('Demo cargada')};
$('#leftToggle').onclick=()=>$('#leftPanel').classList.toggle('show');$('#rightToggle').onclick=()=>$('#rightPanel').classList.toggle('show');
function tick(t){let dt=(t-last)/1000;last=t;if(anim){progress+=dt/7;if(progress>=1){progress=1;anim=false;$('#play').textContent='▶ Recorrido'}draw()}requestAnimationFrame(tick)}
resize();updateUI();
$('#status').textContent='● JavaScript ACTIVO';
$('#modePill').textContent='Modo: seleccionar';
requestAnimationFrame(tick);
})();
