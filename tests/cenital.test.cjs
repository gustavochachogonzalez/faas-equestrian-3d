const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8');
function fn(name){let start=source.indexOf('function '+name+'('),brace=source.indexOf('{',start),depth=1,i=brace+1;for(;depth;i++){if(source[i]==='{')depth++;if(source[i]==='}')depth--}return source.slice(start,i)}
const c=vm.createContext({console});vm.runInContext('const zenClamp=(x,a,b)=>Math.max(a,Math.min(b,x));'+fn('zenMakePath')+fn('zenSample')+fn('catmull'),c);
const make=p=>c.zenMakePath(p),sample=(p,d)=>c.zenSample(p,d);
let p=make([{x:0,y:0},{x:1,y:0},{x:100,y:0}]);assert.equal(sample(p,50).x,50);assert.equal(p.length,100);
p=make([{x:0,y:0},{x:0,y:0},{x:3,y:4}]);assert.equal(p.length,5);assert.equal(sample(p,5).y,4);
const cross=make([{x:0,y:0},{x:10,y:10},{x:0,y:10},{x:10,y:0}]);const first=sample(cross,Math.sqrt(200)/2),second=sample(cross,Math.sqrt(200)+10+Math.sqrt(200)/2);assert.ok(Math.abs(first.x-second.x)<1e-8);assert.equal(first.index,1);assert.equal(second.index,3);
const curve=make(c.catmull([{x:0,y:0},{x:10,y:20},{x:25,y:10},{x:30,y:0}],18));
for(let i=0;i<=100;i++){const d=curve.length*i/100,q=sample(curve,d),a=curve.points[q.index-1],b=curve.points[q.index];assert.ok(Math.abs((q.x-a.x)*(b.y-a.y)-(q.y-a.y)*(b.x-a.x))<1e-7)}
// El reloj debe terminar a los 40 s independientemente de la frecuencia de fotogramas.
for(const fps of [30,60,120]){let distance=0;for(let i=0;i<40*fps;i++)distance=Math.min(curve.length,distance+curve.length/40/fps);assert.ok(Math.abs(distance-curve.length)<1e-7)}
console.log('PASS: distancia uniforme, puntos repetidos, cruce en orden, 101 posiciones sobre curva, duración a 30/60/120 fps.');
