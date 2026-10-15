import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Plus,Minus,Search,Image as ImageIcon,ShoppingBag,ChevronRight,X,ZoomIn,Volume2,VolumeX} from 'lucide-react';
import {playAddSound,playBuySound,playTapSound,isSoundOn,setSoundOn} from './sounds';
import {normEffect} from './titleStyles';
import PhotoViewer from './PhotoViewer';
import {themeVars,themeById} from './themes';
import './catalog.css';

// Catálogo Fácil V83 · CatalogView
// Un único componente dibuja el catálogo. El editor (Vista previa y Diseño) y el enlace
// público usan exactamente este mismo código y estas mismas variables de tema, así que
// lo que se ve en el editor es lo que ven los clientes.

type Mode='public'|'preview';
const money=(n:number,c:string)=>`${c}${new Intl.NumberFormat('es-AR').format(n)}`;
const RADIUS:Record<string,{card:string,hero:string,chip:string}>={
 square:{card:'4px',hero:'6px',chip:'4px'},
 soft:{card:'18px',hero:'26px',chip:'12px'},
 round:{card:'26px',hero:'34px',chip:'18px'},
 pill:{card:'30px',hero:'44px',chip:'999px'}
};

// Sonidos del catálogo: ver sounds.ts

function WhatsAppIcon({size=18}:{size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.5 3.5A11.86 11.86 0 0 0 12.06 0C5.51 0 .18 5.31.18 11.85c0 2.09.55 4.13 1.59 5.93L.08 24l6.39-1.67a11.83 11.83 0 0 0 5.59 1.41h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.14-3.43-8.38ZM12.07 21.72h-.01a9.82 9.82 0 0 1-5.01-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.83 9.83 0 0 1-1.51-5.21c0-5.43 4.42-9.84 9.86-9.84 2.63 0 5.1 1.02 6.96 2.88a9.8 9.8 0 0 1 2.88 6.97c0 5.44-4.43 9.86-9.86 9.86Zm5.41-7.38c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.69.15-.2.3-.78.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.69-1.66-.95-2.28-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"/></svg>}

// Revela cada tarjeta con una animación suave cuando entra en pantalla.
function useReveal(ref:React.RefObject<HTMLElement|null>,dep:string){
 useEffect(()=>{
  const root=ref.current;if(!root)return;
  const els=Array.from(root.querySelectorAll<HTMLElement>('.cvReveal:not(.in)'));
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
  const io=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting){(en.target as HTMLElement).classList.add('in');io.unobserve(en.target)}})},{threshold:0.06,rootMargin:'0px 0px -4% 0px'});
  els.forEach(e=>io.observe(e));
  // Seguro: si por algún motivo no se disparó, todo se muestra igual.
  const t=window.setTimeout(()=>els.forEach(e=>e.classList.add('in')),2500);
  return ()=>{io.disconnect();window.clearTimeout(t)};
 },[ref,dep]);
}

export default function CatalogView({c,mode='public',onShare}:{c:any,mode?:Mode,onShare?:()=>void}){
 const [cat,setCat]=useState('all');
 const [search,setSearch]=useState('');
 const [cart,setCart]=useState<Record<string,number>>({});
 const [selected,setSelected]=useState<any|null>(null);
 const [qty,setQty]=useState(1);
 const [selectedSize,setSelectedSize]=useState('');
 const [selectedColor,setSelectedColor]=useState('');
 const [cartOpen,setCartOpen]=useState(false);
 const [added,setAdded]=useState('');
 const [catalogModal,setCatalogModal]=useState(false);
 const [modalProduct,setModalProduct]=useState<any|null>(null);
 const [photo,setPhoto]=useState<{src:string,alt:string}|null>(null);
 const [stuck,setStuck]=useState(false);
 const contRef=useRef<HTMLDivElement>(null);
 const sentinelRef=useRef<HTMLDivElement>(null);

 const vars=useMemo(()=>themeVars(c),[c.theme,c.accent,c.accentCustom]);
 const tokens=themeById(c.theme);
 const cardR=RADIUS[c.productShape||'soft']||RADIUS.soft;
 const heroR=RADIUS[c.coverShape||'round']||RADIUS.round;
 const isBlankPlaceholder=(value:any,kind:'product'|'category')=>{const v=String(value??'').trim().toLocaleLowerCase('es');return !v||(kind==='product'?/^(nuevo producto|producto nuevo|new product|sin nombre|producto)$/.test(v):/^(nueva categoría|nueva categoria|categoría nueva|categoria nueva|new category|sin nombre)$/.test(v))};
 const products:any[]=(Array.isArray(c.products)?c.products:[]).filter((p:any)=>!isBlankPlaceholder(p.name,'product')||Boolean(String(p.image||'').trim())||Boolean(String(p.description||'').trim())||Number(p.price)>0);
 const categories:any[]=(Array.isArray(c.categories)?c.categories:[]).filter((x:any)=>!isBlankPlaceholder(x.name,'category'));
 const available=products.filter(p=>p.available);
 const visible=available.filter(p=>(cat==='all'||p.category===cat)&&(`${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())));

 useReveal(contRef,visible.map(p=>p.id).join('|')+'|'+cat);

 // El encabezado gana sombra al desplazarse.
 useEffect(()=>{
  const el=sentinelRef.current;if(!el||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(([en])=>setStuck(!en.isIntersecting),{threshold:0});
  io.observe(el);return ()=>io.disconnect();
 },[]);

 // En el catálogo público el fondo de toda la página y la barra del navegador toman el color del tema.
 useEffect(()=>{
  if(mode!=='public')return;
  const prevBody=document.body.style.background;
  const meta=document.querySelector('meta[name="theme-color"]') as HTMLMetaElement|null;
  const prevMeta=meta?.getAttribute('content')||'';
  document.body.style.background=tokens.bg;
  document.documentElement.style.background=tokens.bg;
  meta?.setAttribute('content',tokens.bg);
  return ()=>{document.body.style.background=prevBody;document.documentElement.style.background='';if(meta)meta.setAttribute('content',prevMeta)};
 },[mode,tokens.bg]);

 const items=Object.entries(cart).map(([key,quantity])=>{const [id,size='',color='']=key.split('::');const product=products.find(p=>p.id===id);return product?{key,product,size,color,quantity}:null}).filter(Boolean) as {key:string,product:any,size:string,color:string,quantity:number}[];
 const total=items.reduce((sum,line)=>sum+line.product.price*line.quantity,0);
 const count=items.reduce((sum,line)=>sum+line.quantity,0);
 const qtyOf=(id:string)=>Object.entries(cart).filter(([key])=>key.startsWith(`${id}::`)).reduce<number>((sum,entry)=>sum+Number(entry[1]),0);

 const openQuantity=(p:any)=>{setSelected(p);setQty(1);setSelectedSize((p.sizes||[])[0]||'');setSelectedColor((p.colors||[])[0]||'')};
 const confirmQuantity=()=>{
  if(!selected)return;
  if(selected.usesVariants&&((selected.sizes||[]).length&&!selectedSize||(selected.colors||[]).length&&!selectedColor)){alert('Elegí el talle y el color antes de agregar.');return}
  playAddSound();
  const n=Math.max(1,Math.floor(qty||1));
  const key=`${selected.id}::${selected.usesVariants?selectedSize:''}::${selected.usesVariants?selectedColor:''}`;
  setCart(v=>({...v,[key]:(v[key]||0)+n}));
  setAdded(selected.id);setTimeout(()=>setAdded(''),620);
  setSelected(null);
 };
 const changeQty=(key:string,d:number)=>{playTapSound();return setCart(v=>{const n=Math.max(0,(v[key]||0)+d);const next={...v};if(n)next[key]=n;else delete next[key];return next})};
 const [soundOn,setSoundState]=useState<boolean>(()=>isSoundOn());
 const toggleSound=()=>{const n=!soundOn;setSoundOn(n);setSoundState(n);if(n)playTapSound()};
 const goCatalog=()=>{setCatalogModal(true);setModalProduct(null)};
 const send=()=>{
  if(!c.whatsapp){alert(mode==='public'?'Este catálogo no tiene WhatsApp configurado.':'Configurá el WhatsApp del negocio primero.');return}
  if(!items.length)return;
  playBuySound();
  const lines=items.map(line=>`${line.quantity} x ${line.product.name}${line.size?` · Talle: ${line.size}`:''}${line.color?` · Color: ${line.color}`:''} — ${money(line.product.price*line.quantity,c.currency)}`).join('\n');
  window.open(`https://wa.me/${String(c.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(`Hola, quiero realizar este pedido:\n\n${lines}\n\nTotal: ${money(total,c.currency)}`)}`,'_blank');
 };
 const scrollToProducts=()=>{const el=contRef.current?.querySelector('#productos');el?.scrollIntoView({behavior:'smooth',block:'start'})};

 const subscriptionWarning=c._subscription?.expiresAt?Date.parse(c._subscription.expiresAt)-Date.now()<=7*86400000:null;
 const priceEffect='title-effect-'+normEffect(c.priceEffect,'oro');
 const titleEffect='title-effect-'+normEffect(c.titleEffect,'elegante');
 const descSize=Math.min(c.descriptionSize||16,Math.max(12,(c.titleSize||38)*0.58));
 const rootStyle={...vars,'--cover-radius':heroR.hero,'--card-radius':cardR.card,'--chip-radius':cardR.chip,'--store-title-size':`${c.titleSize||38}px`,'--store-description-size':`${descSize}px`} as any;
 const socials=[['Instagram',c.instagram],['Facebook',c.facebook],['TikTok',c.tiktok],['Sitio web',c.website]].filter(x=>x[1]);

 return <div className={`cvRoot cv-${mode} font-${c.font||'system'} ${tokens.dark?'cv-dark':'cv-light'}${tokens.neon?' cv-neon':''}${tokens.glass?' cv-glass':''}`} style={rootStyle} data-theme={c.theme}>
  <div className="cvCont" ref={contRef}>
   {c._adminAlert&&<div className="cvBanner cvBannerAlert"><span>⚠️</span><span>{c._adminAlert}</span></div>}
   {subscriptionWarning&&<div className="cvBanner cvBannerWarn"><span>⚠️</span><span>Este catálogo está próximo a vencer. Contactá al comercio para confirmar su renovación.</span></div>}
   <div ref={sentinelRef} className="cvSentinel" aria-hidden="true"/>

   <div className={'cvTop'+(stuck?' stuck':'')}>
    <div className="cvWrap cvTopRow">
     <button type="button" className="cvBrand" onClick={goCatalog} aria-label="Explorar catálogo">
      {c.logo?<img src={c.logo} alt=""/>:<span className="cvBrandMark">✦</span>}
      <b>{c.name}</b>
     </button>
     <div className="cvTopActions">
      <button type="button" className="cvGhost cvSound" onClick={toggleSound} aria-label={soundOn?'Silenciar sonidos':'Activar sonidos'} aria-pressed={soundOn} title={soundOn?'Sonido activado':'Sonido desactivado'}>{soundOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
      <button type="button" className="cvGhost" onClick={goCatalog}>Catálogo</button>
      {onShare&&<button type="button" className="cvGhost cvShare" onClick={onShare}><WhatsAppIcon size={15}/><span>Compartir</span></button>}
      <button type="button" className="cvCartBtn" onClick={()=>count>0&&setCartOpen(true)} aria-label={`Carrito, ${count} productos`}>
       <ShoppingBag size={18}/>{count>0&&<i key={count}>{count}</i>}
      </button>
     </div>
    </div>
   </div>

   <div className="cvWrap">
    <section className="cvHero">
     {c.cover?<img className="cvHeroImg" src={c.cover} alt="" aria-hidden="true"/>:<div className="cvHeroArt" aria-hidden="true"><i/><i/><i/></div>}
     <div className="cvHeroShade" aria-hidden="true"/>
     <div className="cvHeroBody">
      {c.logo&&<img className="cvHeroLogo" src={c.logo} alt=""/>}
      <h1 className={'storeTitle '+titleEffect}>{c.name}</h1>
      {c.description&&<p className="storeDescription">{c.description}</p>}
      <div className="cvHeroFoot">
       <button type="button" className="cvCta" onClick={scrollToProducts}>Ver productos<ChevronRight size={16}/></button>
       <span className="cvStat"><b>{available.length}</b> producto{available.length===1?'':'s'}</span>
       {categories.length>0&&<span className="cvStat"><b>{categories.length}</b> categoría{categories.length===1?'':'s'}</span>}
      </div>
     </div>
    </section>

    {socials.length>0&&<div className="cvSocials">{socials.map(([label,href])=><a key={String(label)} href={String(href)} target="_blank" rel="noreferrer"><i/>{label}</a>)}</div>}
   </div>

   <div className="cvTools">
    <div className="cvWrap cvToolsRow">
     <label className="cvSearch"><Search size={17}/><input aria-label="Buscar productos" placeholder="Buscar productos…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button type="button" aria-label="Borrar búsqueda" onClick={()=>setSearch('')}><X size={15}/></button>}</label>
     <div className="cvCats" role="tablist" aria-label="Categorías">
      <button type="button" role="tab" aria-selected={cat==='all'} className={cat==='all'?'on':''} onClick={()=>{setCat('all');setTimeout(goCatalog,20)}}>Todos</button>
      {categories.map((x:any)=><button type="button" role="tab" aria-selected={cat===x.id} key={x.id} className={cat===x.id?'on':''} onClick={()=>{setCat(x.id);setTimeout(goCatalog,20)}}>{x.emoji} {x.name}</button>)}
     </div>
    </div>
   </div>

   <div className="cvWrap">
    <div id="productos" className="cvGrid">
     {visible.map((p:any,i:number)=><div className="cvReveal" style={{'--i':Math.min(i,7)} as any} key={p.id}>
      <article className={'cvCard'+(p.usesVariants?' hasVariants':'')+(added===p.id?' productAdded':'')}>
       <div className={'cvCardImg'+(p.image?' hasPhoto':'')} onClick={()=>{if(p.image)setPhoto({src:p.image,alt:p.name})}} role={p.image?'button':undefined} tabIndex={p.image?0:undefined} aria-label={p.image?`Ampliar foto de ${p.name}`:undefined} onKeyDown={e=>{if(p.image&&(e.key==='Enter'||e.key===' ')){e.preventDefault();setPhoto({src:p.image,alt:p.name})}}}>
        {p.image?<img src={p.image} alt={p.name} loading="lazy" decoding="async"/>:<ImageIcon size={30}/>}
        {p.image&&<span className="cvZoom"><ZoomIn size={15}/></span>}
        {p.usesVariants&&<span className="cvTag">Talles y colores</span>}
       </div>
       <div className="cvCardBody">
        <h3 className="cvName">{p.name}</h3>
        {p.description?<p className="cvDesc">{(p.description||'').slice(0,200)}</p>:<p className="cvDesc empty"/>}
        {p.usesVariants&&<small className="cvVariants">{(p.sizes||[]).length?`${(p.sizes||[]).join(' / ')}`:''}{(p.sizes||[]).length&&(p.colors||[]).length?' · ':''}{(p.colors||[]).length?`${(p.colors||[]).length} colores`:''}</small>}
        <div className="cvBuy">
         <div className="cvPriceWrap"><strong className={'cvPrice '+priceEffect}>{money(p.price,c.currency)}</strong></div>
         <button type="button" className="cvAdd" onClick={()=>openQuantity(p)}><Plus size={17}/><span>{p.usesVariants?'Elegir opciones':'Agregar'}</span></button>
        </div>
       </div>
       {qtyOf(p.id)>0&&<span className="cvQty" key={qtyOf(p.id)}>{qtyOf(p.id)}</span>}
      </article>
     </div>)}
    </div>
    {!visible.length&&<div className="cvEmpty"><ImageIcon size={34}/><b>{products.length?'No encontramos productos':'Todavía no hay productos'}</b><span>{products.length?'Probá con otra búsqueda o categoría.':'Agregá productos desde el editor para verlos acá.'}</span></div>}

    <div className="cvFoot">
     <b>{c.name}</b>
     {c.whatsapp&&<span><WhatsAppIcon size={14}/> Pedidos por WhatsApp</span>}
     <a className="cvDirLink" href={`${location.pathname}?directory=1`} target={mode==='public'?'_self':'_blank'} rel="noopener">Ver todos los catálogos</a>
    </div>
   </div>
  </div>

  {count>0&&<div className={'cvCart'+(cartOpen?' cartOpen':'')}>
   <button type="button" className="cvCartSummary" onClick={()=>setCartOpen(v=>!v)}><div><b>Mi carrito · {count} producto{count===1?'':'s'}</b><strong>{money(total,c.currency)}</strong></div><span>{cartOpen?'Ocultar':'Ver carrito'}</span></button>
   <button type="button" className="cvOrder" onClick={send}><WhatsAppIcon size={18}/>Pedir por WhatsApp</button>
  </div>}

  {cartOpen&&count>0&&<div className="cvOverlay cvOverlayLight" onClick={()=>setCartOpen(false)}>
   <div className="cvDrawer" role="dialog" aria-modal="true" aria-label="Mi carrito" onClick={e=>e.stopPropagation()}>
    <div className="cvSheetHandle" aria-hidden="true"/>
    <div className="cvSheetHead"><b>Mi carrito</b><button type="button" onClick={()=>setCartOpen(false)}>Cerrar</button></div>
    <div className="cvLines">{items.map(line=><div className="cvLine" key={line.key}>
     <div><b>{line.product.name}</b><span>{[line.size&&`Talle ${line.size}`,line.color&&`Color ${line.color}`].filter(Boolean).join(' · ')||'Sin variantes'} · {money(line.product.price,c.currency)} c/u</span></div>
     <div className="cvStepper"><button type="button" aria-label="Quitar uno" onClick={()=>changeQty(line.key,-1)}><Minus size={15}/></button><strong>{line.quantity}</strong><button type="button" aria-label="Agregar uno" onClick={()=>changeQty(line.key,1)}><Plus size={15}/></button></div>
    </div>)}</div>
    <div className="cvTotal"><span>Total</span><strong>{money(total,c.currency)}</strong></div>
    <button type="button" className="cvOrder cvOrderWide" onClick={send}><WhatsAppIcon size={18}/>Pedir por WhatsApp</button>
   </div>
  </div>}

  {catalogModal&&<div className="cvOverlay" onClick={()=>{setCatalogModal(false);setModalProduct(null)}}>
   <section className="cvSheet cvPicker" role="dialog" aria-modal="true" aria-label="Explorar catálogo" onClick={e=>e.stopPropagation()}>
    <div className="cvSheetHandle" aria-hidden="true"/>
    <div className="cvSheetHead"><div><small>EXPLORAR</small><h2>{modalProduct?modalProduct.name:'Catálogo'}</h2></div><button type="button" aria-label="Cerrar" onClick={()=>{setCatalogModal(false);setModalProduct(null)}}><X size={18}/></button></div>
    {modalProduct?<div className="cvPickDetail" key={modalProduct.id}>
     {modalProduct.image&&<button type="button" className="cvPickImg" onClick={()=>setPhoto({src:modalProduct.image,alt:modalProduct.name})} aria-label="Ampliar foto"><img src={modalProduct.image} alt={modalProduct.name}/><span className="cvZoom"><ZoomIn size={15}/></span></button>}
     <p>{modalProduct.description||'Sin descripción adicional.'}</p>
     <div className="cvPriceWrap"><strong className={'cvPrice '+priceEffect}>{money(modalProduct.price,c.currency)}</strong></div>
     <button type="button" className="cvPrimary" onClick={()=>{setCatalogModal(false);openQuantity(modalProduct)}}><Plus size={17}/>Agregar al carrito</button>
     <button type="button" className="cvLink" onClick={()=>setModalProduct(null)}>Volver a productos</button>
    </div>:<>
     <div className="cvPickCats"><button type="button" className={cat==='all'?'on':''} onClick={()=>setCat('all')}>Todos</button>{categories.map((x:any)=><button type="button" key={x.id} className={cat===x.id?'on':''} onClick={()=>setCat(x.id)}>{x.emoji} {x.name}</button>)}</div>
     <div className="cvPickList">{visible.map((p:any,i:number)=><button type="button" className="cvPickRow" style={{'--i':Math.min(i,9)} as any} key={p.id} onClick={()=>setModalProduct(p)}>{p.image?<img src={p.image} alt=""/>:<span className="cvPickNo">✦</span>}<span><b>{p.name}</b><small>{p.description||'Ver detalle del producto'}</small><strong>{money(p.price,c.currency)}</strong></span><ChevronRight size={18}/></button>)}{!visible.length&&<p className="cvPickEmpty">No hay productos en esta categoría.</p>}</div>
    </>}
   </section>
  </div>}

  {selected&&<div className="cvOverlay" onClick={()=>setSelected(null)}>
   <div className="cvSheet cvQtyModal" role="dialog" aria-modal="true" aria-label="Elegí tu opción" onClick={e=>e.stopPropagation()}>
    <div className="cvSheetHandle" aria-hidden="true"/>
    <span className="cvEyebrow">Elegí tu opción</span>
    <h3>{selected.name}</h3>
    <div className="cvQtyPrice"><strong className={'cvPrice '+priceEffect}>{money(selected.price,c.currency)}</strong></div>
    {selected.usesVariants&&(!!(selected.sizes||[]).length||!!(selected.colors||[]).length)&&<div className="cvVariantPick">
     {(selected.sizes||[]).length>0&&<label><b>Talle</b><select value={selectedSize} onChange={e=>setSelectedSize(e.target.value)}><option value="">Seleccionar talle</option>{(selected.sizes||[]).map((size:string)=><option key={size} value={size}>{size}</option>)}</select></label>}
     {(selected.colors||[]).length>0&&<label><b>Color</b><select value={selectedColor} onChange={e=>setSelectedColor(e.target.value)}><option value="">Seleccionar color</option>{(selected.colors||[]).map((color:string)=><option key={color} value={color}>{color}</option>)}</select></label>}
    </div>}
    <div className="cvStepper cvStepperBig"><button type="button" aria-label="Menos" onClick={()=>setQty(v=>Math.max(1,v-1))}><Minus size={18}/></button><strong>{qty}</strong><button type="button" aria-label="Más" onClick={()=>setQty(v=>v+1)}><Plus size={18}/></button></div>
    <button type="button" className="cvPrimary" onClick={confirmQuantity}>Agregar {qty}</button>
    <button type="button" className="cvLink" onClick={()=>setSelected(null)}>Cancelar</button>
   </div>
  </div>}

  {photo&&<PhotoViewer src={photo.src} alt={photo.alt} onClose={()=>setPhoto(null)}/>}
 </div>;
}
