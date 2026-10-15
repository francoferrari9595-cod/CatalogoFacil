import React,{useEffect,useRef,useState} from 'react';
import {Search,ShoppingBag,ArrowLeft,Store,RefreshCw,Stethoscope} from 'lucide-react';

type Item={slug:string,name:string,description:string,products:number,accent:string,image:boolean};
const PAGE=24;
class DirError extends Error{kind:'net'|'old'|'bad';constructor(kind:'net'|'old'|'bad'){super(kind);this.kind=kind}}
// Pide el directorio con tiempo límite. 'old' = el Worker de Cloudflare todavía no tiene el directorio.
async function fetchDirectory(api:string,params:string,ms=12000):Promise<any>{
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),ms);
 let r:Response;
 try{r=await fetch(`${api}/directory?${params}`,{signal:ctl.signal})}catch{throw new DirError('net')}finally{clearTimeout(timer)}
 let d:any=null;
 try{d=await r.json()}catch{throw new DirError('old')}
 if(!d||d.ok!==true||!Array.isArray(d.catalogs))throw new DirError(r.status===404||(d&&d.ok===false)?'old':'bad');
 return d;
}
const accentOf=(a:string)=>/^#[0-9a-fA-F]{6}$/.test(a||'')?a:'#8b5cf6';

function Card({it,api,base}:{it:Item,api:string,base:string}){
 const [imgOk,setImgOk]=useState(it.image);
 const a=accentOf(it.accent);
 return <a className="dirCard" href={`${base}?catalog=${encodeURIComponent(it.slug)}`} style={{'--a':a} as any}>
  <div className="dirThumb">
   {imgOk?<img src={`${api}/catalog-image/${encodeURIComponent(it.slug)}`} alt="" loading="lazy" decoding="async" onError={()=>setImgOk(false)}/>:<span>{(it.name||'?').trim().charAt(0).toUpperCase()}</span>}
  </div>
  <div className="dirInfo">
   <b>{it.name}</b>
   {it.description&&<p>{it.description}</p>}
   <div className="dirMeta"><span><ShoppingBag size={13}/> {it.products} producto{it.products===1?'':'s'}</span><em>Ver y comprar</em></div>
  </div>
 </a>;
}

export default function Directory({api}:{api:string}){
 const base=location.origin+location.pathname;
 const [q,setQ]=useState('');
 const [items,setItems]=useState<Item[]>([]);
 const [total,setTotal]=useState(0);
 const [state,setState]=useState<'loading'|'ok'|'error'>('loading');
 const [more,setMore]=useState(false);
 const seq=useRef(0);
 const canBack=(()=>{try{return !!document.referrer&&new URL(document.referrer).origin===location.origin}catch{return false}})();

 const [errKind,setErrKind]=useState<'net'|'old'|'bad'>('net');
 const load=async(offset:number,query:string)=>{
  const my=++seq.current;
  offset?setMore(true):setState('loading');
  try{
   const d=await fetchDirectory(api,`limit=${PAGE}&offset=${offset}&q=${encodeURIComponent(query)}`);
   if(my!==seq.current)return;
   setItems(v=>offset?[...v,...d.catalogs]:d.catalogs);
   setTotal(Number(d.total)||0);
   setState('ok');
  }catch(e:any){if(my===seq.current&&!offset){setErrKind(e?.kind||'bad');setState('error')}}
  finally{if(my===seq.current)setMore(false)}
 };
 useEffect(()=>{document.title='Todos los catálogos · Catálogo Fácil'},[]);
 useEffect(()=>{const t=setTimeout(()=>load(0,q.trim()),q?350:0);return()=>clearTimeout(t)},[q]);

 return <div className="dirRoot">
  <header className="dirTop">
   <div className="dirWrap dirTopRow">
    {canBack?<button type="button" className="dirBack" onClick={()=>history.back()}><ArrowLeft size={16}/> Volver</button>:<span className="dirBrand"><Store size={16}/> Catálogo Fácil</span>}
    <a className="dirCreate" href={base}>Crear mi catálogo</a>
   </div>
  </header>
  <main className="dirWrap">
   <section className="dirHero">
    <h1>Todos los catálogos</h1>
    <p>Descubrí negocios, mirá sus productos y hacé tu pedido directo por WhatsApp.</p>
    <label className="dirSearch"><Search size={18}/><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar un negocio o rubro…" aria-label="Buscar catálogos"/></label>
   </section>
   {state==='loading'&&<div className="dirGrid" aria-busy="true">{Array.from({length:8}).map((_,i)=><div className="dirCard dirSkel" key={i}><div className="dirThumb"/><div className="dirInfo"><b/><p/></div></div>)}</div>}
   {state==='error'&&<div className="dirEmpty"><Store size={34}/><b>{errKind==='old'?'El directorio todavía no está disponible':'No pudimos cargar los catálogos'}</b><span>{errKind==='old'?'Estamos actualizando el servidor. Probá de nuevo en unos minutos.':'Revisá tu conexión e intentá de nuevo.'}</span><button type="button" onClick={()=>load(0,q.trim())}><RefreshCw size={15}/> Reintentar</button></div>}
   {state==='ok'&&!items.length&&<div className="dirEmpty"><Store size={34}/><b>{q?'No encontramos catálogos con esa búsqueda':'Todavía no hay catálogos publicados'}</b><span>{q?'Probá con otro nombre.':'Volvé pronto.'}</span></div>}
   {state==='ok'&&items.length>0&&<>
    <p className="dirCount">{total} catálogo{total===1?'':'s'}</p>
    <div className="dirGrid">{items.map(it=><Card key={it.slug} it={it} api={api} base={base}/>)}</div>
    {items.length<total&&<div className="dirMoreWrap"><button type="button" className="dirMore" disabled={more} onClick={()=>load(items.length,q.trim())}>{more?'Cargando…':'Ver más catálogos'}</button></div>}
   </>}
  </main>
  <footer className="dirFoot">Catálogo Fácil · by Franco Ferrari</footer>
 </div>;
}

// Herramienta para el dueño (pestaña Publicar): dice exactamente por qué se ve o no se ve el directorio.
export function DirectoryCheck({api,slug}:{api:string,slug:string}){
 const [busy,setBusy]=useState(false);
 const [res,setRes]=useState<{ok:boolean,lines:string[]}|null>(null);
 const run=async()=>{
  setBusy(true);setRes(null);
  try{
   const d=await fetchDirectory(api,`limit=1&check=${encodeURIComponent(slug)}`);
   const lines=[`✓ El Worker de Cloudflare está actualizado y el directorio responde (${d.total} catálogo${d.total===1?'':'s'} visible${d.total===1?'':'s'}).`];
   const ch=d.check;let ok=true;
   if(ch){
    if(ch.visible)lines.push(`✓ Tu catálogo «${ch.slug}» aparece en el directorio.`);
    else{ok=false;lines.push(({
     'not-found':`✗ El catálogo «${ch.slug}» no está publicado todavía. Presioná Publicar catálogo.`,
     'not-approved':`✗ El catálogo «${ch.slug}» está pendiente de aprobación o desactivado. Se aprueba desde el panel administrador.`,
     'hidden':`✗ Tiene desmarcada la casilla «Mostrar mi catálogo en Ver todos los catálogos» (pestaña Negocio). Marcala y volvé a publicar.`,
     'expired':`✗ El catálogo «${ch.slug}» está vencido.`,
     'empty':`✗ El catálogo «${ch.slug}» no tiene productos publicados.`} as any)[ch.reason]||'✗ Tu catálogo no aparece en el directorio.');}
   }
   if(d.total===0)lines.push('Todavía no hay catálogos aprobados para mostrar.');
   setRes({ok,lines});
  }catch(e:any){
   setRes({ok:false,lines:e?.kind==='net'
    ?['✗ No se pudo conectar con el servidor de catálogos. Revisá tu conexión y la dirección en public/api-config.js.']
    :['✗ El Worker de Cloudflare TODAVÍA NO tiene el directorio (es una versión anterior).','Solución: en Cloudflare abrí Workers & Pages → tu Worker → Edit code, reemplazá todo el código por el archivo publisher/worker.js de esta versión y presioná Deploy. No hace falta cambiar nada más.']});
  }finally{setBusy(false)}
 };
 return <div className="dirCheck" style={{marginTop:16,padding:14,border:'1px solid rgba(128,128,150,.35)',borderRadius:14}}>
  <b style={{display:'flex',alignItems:'center',gap:8}}><Stethoscope size={16}/> Estado del directorio «Ver todos los catálogos»</b>
  <div style={{margin:'8px 0',fontSize:13,opacity:.8}}>Comprobá si el servidor está actualizado y si tu catálogo aparece.</div>
  <button type="button" className="secondary" disabled={busy} onClick={run}>{busy?'Comprobando…':'Comprobar directorio'}</button>
  {res&&<div role="status" style={{marginTop:10,display:'grid',gap:4,fontSize:13.5}}>{res.lines.map((l,i)=><span key={i}>{l}</span>)}</div>}
 </div>;
}
