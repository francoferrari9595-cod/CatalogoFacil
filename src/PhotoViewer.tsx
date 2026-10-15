import React,{useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';

// Visor de fotos V83.
// - Zoom con pellizco (2 dedos), rueda del mouse, botones y doble toque.
// - Con zoom activo se puede ARRASTRAR la foto en cualquier dirección y llegar a todos sus bordes.
// - El zoom se centra en el punto tocado (no en el centro de la imagen).
// - Nunca deja la foto "perdida" fuera de pantalla: los límites se recalculan según el zoom.

const MIN=1,MAX=6;
type View={s:number,x:number,y:number};

export default function PhotoViewer({src,alt,onClose}:{src:string,alt?:string,onClose:()=>void}){
 const stageRef=useRef<HTMLDivElement>(null);
 const imgRef=useRef<HTMLImageElement>(null);
 const [view,setViewState]=useState<View>({s:1,x:0,y:0});
 const viewRef=useRef<View>({s:1,x:0,y:0});
 const [dragging,setDragging]=useState(false);
 const [loaded,setLoaded]=useState(false);
 const pointers=useRef<Map<number,{x:number,y:number}>>(new Map());
 const gesture=useRef<{mode:'none'|'pan'|'pinch',startX:number,startY:number,vx:number,vy:number,dist:number,scale:number,cx:number,cy:number,moved:boolean}>({mode:'none',startX:0,startY:0,vx:0,vy:0,dist:0,scale:1,cx:0,cy:0,moved:false});
 const lastTap=useRef(0);

 const setView=useCallback((v:View)=>{viewRef.current=v;setViewState(v)},[]);

 // Mantiene la imagen dentro de límites razonables según el zoom actual.
 const clampView=useCallback((v:View):View=>{
  const stage=stageRef.current,img=imgRef.current;
  const s=Math.min(MAX,Math.max(MIN,v.s));
  if(!stage||!img)return {s,x:v.x,y:v.y};
  const sw=stage.clientWidth,sh=stage.clientHeight;
  const iw=img.offsetWidth*s,ih=img.offsetHeight*s;
  const maxX=Math.max(0,(iw-sw)/2),maxY=Math.max(0,(ih-sh)/2);
  // Pequeño margen elástico para que el movimiento se sienta natural al llegar al borde.
  const pad=s>1.001?56:0; // margen para poder sacar los bordes de debajo de los botones
  const lx=maxX+(iw>sw?pad:0),ly=maxY+(ih>sh?pad:0);
  return {s,x:s<=1.001?0:Math.min(lx,Math.max(-lx,v.x)),y:s<=1.001?0:Math.min(ly,Math.max(-ly,v.y))};
 },[]);

 // Zoom hacia un punto (coordenadas relativas al centro del escenario).
 const zoomAt=useCallback((nextScale:number,px:number,py:number,base?:View)=>{
  const cur=base||viewRef.current;
  const s=Math.min(MAX,Math.max(MIN,nextScale));
  const qx=(px-cur.x)/cur.s,qy=(py-cur.y)/cur.s;
  setView(clampView({s,x:px-qx*s,y:py-qy*s}));
 },[clampView,setView]);

 const center=()=>{const r=stageRef.current?.getBoundingClientRect();return r?{x:r.left+r.width/2,y:r.top+r.height/2}:{x:0,y:0}};
 const rel=(clientX:number,clientY:number)=>{const c=center();return {x:clientX-c.x,y:clientY-c.y}};

 const reset=useCallback(()=>setView({s:1,x:0,y:0}),[setView]);
 const step=useCallback((delta:number)=>{const cur=viewRef.current;const next=delta>0?cur.s*1.4:cur.s/1.4;if(next<=1.02){reset();return}zoomAt(next,0,0)},[reset,zoomAt]);

 // Rueda del mouse: listener no pasivo para poder evitar el scroll de la página.
 useEffect(()=>{
  const el=stageRef.current;if(!el)return;
  const onWheel=(e:WheelEvent)=>{e.preventDefault();const p=rel(e.clientX,e.clientY);const factor=Math.exp(-e.deltaY*0.0022);const cur=viewRef.current;const next=cur.s*factor;if(next<=1.02&&cur.s<=1.02){reset();return}zoomAt(next,p.x,p.y)};
  el.addEventListener('wheel',onWheel,{passive:false});
  return ()=>el.removeEventListener('wheel',onWheel);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[zoomAt,reset]);

 // Bloquea el scroll del fondo y soporta el teclado.
 useEffect(()=>{
  const prev=document.body.style.overflow;document.body.style.overflow='hidden';
  const onKey=(e:KeyboardEvent)=>{
   if(e.key==='Escape')onClose();
   else if(e.key==='+'||e.key==='=')step(1);
   else if(e.key==='-'||e.key==='_')step(-1);
   else if(e.key==='0')reset();
   else if(viewRef.current.s>1.01){const d=60;const v=viewRef.current;if(e.key==='ArrowLeft')setView(clampView({...v,x:v.x+d}));if(e.key==='ArrowRight')setView(clampView({...v,x:v.x-d}));if(e.key==='ArrowUp')setView(clampView({...v,y:v.y+d}));if(e.key==='ArrowDown')setView(clampView({...v,y:v.y-d}))}
  };
  window.addEventListener('keydown',onKey);
  return ()=>{document.body.style.overflow=prev;window.removeEventListener('keydown',onKey)};
 },[onClose,step,reset,setView,clampView]);

 // Al cambiar el tamaño de la ventana se recalculan los límites.
 useLayoutEffect(()=>{
  const on=()=>setView(clampView(viewRef.current));
  window.addEventListener('resize',on);
  return ()=>window.removeEventListener('resize',on);
 },[clampView,setView]);

 const onPointerDown=(e:React.PointerEvent)=>{
  const stage=stageRef.current;if(!stage)return;
  try{stage.setPointerCapture(e.pointerId)}catch{}
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const g=gesture.current;
  if(pointers.current.size===1){g.mode='pan';g.startX=e.clientX;g.startY=e.clientY;g.vx=viewRef.current.x;g.vy=viewRef.current.y;g.moved=false;setDragging(true)}
  else if(pointers.current.size===2){
   const [a,b]=Array.from(pointers.current.values());
   g.mode='pinch';g.dist=Math.hypot(a.x-b.x,a.y-b.y)||1;g.scale=viewRef.current.s;g.moved=true;
   const mid=rel((a.x+b.x)/2,(a.y+b.y)/2);g.cx=mid.x;g.cy=mid.y;g.vx=viewRef.current.x;g.vy=viewRef.current.y;
  }
 };
 const onPointerMove=(e:React.PointerEvent)=>{
  if(!pointers.current.has(e.pointerId))return;
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const g=gesture.current;
  if(g.mode==='pinch'&&pointers.current.size>=2){
   const [a,b]=Array.from(pointers.current.values());
   const dist=Math.hypot(a.x-b.x,a.y-b.y)||1;
   const mid=rel((a.x+b.x)/2,(a.y+b.y)/2);
   const s=Math.min(MAX,Math.max(MIN,g.scale*(dist/g.dist)));
   // El punto de la imagen bajo los dedos al empezar se mantiene bajo los dedos (zoom + arrastre a la vez).
   const qx=(g.cx-g.vx)/g.scale,qy=(g.cy-g.vy)/g.scale;
   setView(clampView({s,x:mid.x-qx*s,y:mid.y-qy*s}));
  }else if(g.mode==='pan'){
   const dx=e.clientX-g.startX,dy=e.clientY-g.startY;
   if(Math.abs(dx)+Math.abs(dy)>4)g.moved=true;
   if(viewRef.current.s>1.001)setView(clampView({s:viewRef.current.s,x:g.vx+dx,y:g.vy+dy}));
  }
 };
 const onPointerUp=(e:React.PointerEvent)=>{
  const had=pointers.current.has(e.pointerId);
  pointers.current.delete(e.pointerId);
  try{stageRef.current?.releasePointerCapture(e.pointerId)}catch{}
  const g=gesture.current;
  if(pointers.current.size===1){
   // Pasó de 2 dedos a 1: continuar arrastrando sin saltos.
   const [p]=Array.from(pointers.current.values());g.mode='pan';g.startX=p.x;g.startY=p.y;g.vx=viewRef.current.x;g.vy=viewRef.current.y;g.moved=true;
  }else if(pointers.current.size===0){
   setDragging(false);
   if(had&&g.mode==='pan'&&!g.moved){
    // Doble toque / doble clic: alterna entre vista completa y zoom en el punto tocado.
    const now=Date.now();
    if(now-lastTap.current<320){lastTap.current=0;const p=rel(e.clientX,e.clientY);if(viewRef.current.s>1.05)reset();else zoomAt(2.6,p.x,p.y)}
    else lastTap.current=now;
   }
   g.mode='none';
   setView(clampView(viewRef.current));
  }
 };

 const pct=Math.round(view.s*100);
 return <div className="pvRoot" role="dialog" aria-modal="true" aria-label="Foto ampliada">
  <div className="pvBackdrop" onClick={onClose}/>
  <div className="pvBar">
   <div className="pvTools" onClick={e=>e.stopPropagation()}>
    <button type="button" aria-label="Alejar" onClick={()=>step(-1)} disabled={view.s<=1.001}>−</button>
    <span className="pvPct" aria-live="polite">{pct}%</span>
    <button type="button" aria-label="Acercar" onClick={()=>step(1)} disabled={view.s>=MAX-0.01}>+</button>
    <button type="button" className="pvReset" onClick={reset} disabled={view.s<=1.001}>Ver completa</button>
   </div>
   <button type="button" className="pvClose" aria-label="Cerrar foto" onClick={onClose}>×</button>
  </div>
  <div ref={stageRef} className={'pvStage'+(dragging?' dragging':'')+(view.s>1.001?' zoomed':'')} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
   {!loaded&&<div className="pvSpinner" aria-hidden="true"/>}
   <img ref={imgRef} src={src} alt={alt||'Foto del producto ampliada'} draggable={false} onLoad={()=>{setLoaded(true);setView(clampView(viewRef.current))}} style={{transform:`translate3d(${view.x}px,${view.y}px,0) scale(${view.s})`,opacity:loaded?1:0,transition:dragging||gesture.current.mode==='pinch'?'opacity .25s ease':'transform .22s cubic-bezier(.2,.8,.2,1),opacity .25s ease'}}/>
  </div>
  <div className="pvHint">{view.s>1.001?'Arrastrá para moverte por toda la foto · doble toque para volver':'Pellizcá o tocá dos veces para acercar · rueda del mouse en computadora'}</div>
 </div>;
}
