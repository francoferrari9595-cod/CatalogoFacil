// Sonidos del catálogo (sintetizados con Web Audio: no necesitan archivos ni internet).
// Seguros: si el dispositivo no soporta audio, o el usuario lo silenció, simplemente no suenan.
const KEY='cf_sound_on';
let ctx:AudioContext|null=null;
let on:boolean|null=null;
export function isSoundOn():boolean{
 if(on!==null)return on;
 try{on=localStorage.getItem(KEY)!=='0'}catch{on=true}
 return on;
}
export function setSoundOn(v:boolean){on=v;try{localStorage.setItem(KEY,v?'1':'0')}catch{}}
function ac():AudioContext|null{
 try{
  const AC=(window as any).AudioContext||(window as any).webkitAudioContext;
  if(!AC)return null;
  if(!ctx||ctx.state==='closed')ctx=new AC();
  if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx;
 }catch{return null}
}
type Note={f:number;t:number;d:number;v?:number;type?:OscillatorType;f2?:number};
function play(notes:Note[]){
 if(!isSoundOn())return;
 const c=ac();if(!c)return;
 try{
  const now=c.currentTime+0.01;
  const master=c.createGain();master.gain.value=0.9;master.connect(c.destination);
  notes.forEach(n=>{
   const o=c.createOscillator(),g=c.createGain();
   o.type=n.type||'sine';
   o.frequency.setValueAtTime(n.f,now+n.t);
   if(n.f2)o.frequency.exponentialRampToValueAtTime(n.f2,now+n.t+n.d);
   const v=n.v??0.12;
   g.gain.setValueAtTime(0.0001,now+n.t);
   g.gain.exponentialRampToValueAtTime(v,now+n.t+0.012);
   g.gain.exponentialRampToValueAtTime(0.0001,now+n.t+n.d);
   o.connect(g);g.connect(master);
   o.start(now+n.t);o.stop(now+n.t+n.d+0.03);
  });
 }catch{}
}
function buzz(ms:number|number[]){try{if(navigator.vibrate)navigator.vibrate(ms)}catch{}}
// Agregar al carrito: "pop" ascendente, corto y agradable
export function playAddSound(){
 play([{f:523,t:0,d:0.16,type:'triangle',v:0.13},{f:784,t:0.08,d:0.2,type:'triangle',v:0.13},{f:1568,t:0.08,d:0.12,type:'sine',v:0.04}]);
 buzz(18);
}
// Tocar "comprar / pedir": campanilla de caja registradora, más festiva
export function playBuySound(){
 play([
  {f:1046,t:0,d:0.14,type:'square',v:0.035},
  {f:1318,t:0.09,d:0.16,type:'triangle',v:0.12},
  {f:1568,t:0.19,d:0.18,type:'triangle',v:0.12},
  {f:2093,t:0.3,d:0.45,type:'sine',v:0.14},
  {f:4186,t:0.3,d:0.3,type:'sine',v:0.03}
 ]);
 buzz([22,40,30]);
}
// Sumar o restar cantidad: "tic" muy suave
export function playTapSound(){
 play([{f:620,f2:760,t:0,d:0.07,type:'sine',v:0.07}]);
}
