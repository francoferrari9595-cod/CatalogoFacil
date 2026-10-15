const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
  'Cache-Control': 'no-store'
};
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }); }
function cleanSlug(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'catalogo'; }
const enc = new TextEncoder();
function hex(bytes) { return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,'0')).join(''); }
async function hashPassword(password, salt) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(`${salt}:${password}`))); }
async function readIndex(env) { try { return JSON.parse(await env.CATALOGS.get('catalog-index') || '{}'); } catch { return {}; } }
async function writeIndex(env, index) { await env.CATALOGS.put('catalog-index', JSON.stringify(index)); }
function adminOK(request, env) { return Boolean(env.ADMIN_KEY) && request.headers.get('X-Admin-Key') === env.ADMIN_KEY; }
export default {
 async fetch(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  const url = new URL(request.url);
  const shareMatch = url.pathname.match(/^\/share\/([^/]+)$/);
  const imageMatch = url.pathname.match(/^\/catalog-image\/([^/]+)$/);
  if (request.method === 'GET' && (shareMatch || imageMatch)) {
   const slug = cleanSlug(decodeURIComponent((shareMatch || imageMatch)[1]));
   const raw = await env.CATALOGS.get(`catalog:${slug}`);
   if (!raw) return new Response('Catálogo no encontrado.', {status:404,headers:{...corsHeaders,'Content-Type':'text/plain; charset=utf-8'}});
   let catalog; try { catalog=JSON.parse(raw); } catch { return new Response('Catálogo inválido.',{status:500,headers:corsHeaders}); }
   const index = await readIndex(env); const meta=index[slug];
   if (meta && meta.status && meta.status !== 'active') return new Response('Catálogo temporalmente pausado.',{status:403,headers:{...corsHeaders,'Content-Type':'text/plain; charset=utf-8'}});
   if (meta?.expiresAt && Date.now() >= Date.parse(meta.expiresAt)) { const help=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Catálogo vencido</title><meta name="robots" content="noindex"></head><body style="margin:0;background:#09090c;color:#fff;font:16px system-ui;min-height:100vh;display:grid;place-items:center;text-align:center"><main style="max-width:520px;padding:32px;border:1px solid #393039;border-radius:24px;background:#151116"><div style="font-size:42px">⏳</div><h1>Este catálogo está vencido</h1><p>Para renovar el servicio o solicitar ayuda, comunicate con soporte técnico.</p><p><a style="display:block;margin:14px 0;padding:13px;border-radius:12px;background:#22c55e;color:#06210f;text-decoration:none;font-weight:800" href="https://wa.me/542615407856?text=${encodeURIComponent('Hola, necesito renovar el catálogo '+slug+'.')}">WhatsApp 2615407856</a><a style="color:#c4b5fd" href="mailto:francoferrari95@gmail.com?subject=${encodeURIComponent('Renovación catálogo '+slug)}">francoferrari95@gmail.com</a></p></main></body></html>`; return new Response(help,{status:403,headers:{...corsHeaders,'Content-Type':'text/html; charset=utf-8'}}); }
   const image = String(catalog.logo || catalog.cover || '');
   if (imageMatch) {
    const m=image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
    if(!m)return new Response('Imagen no disponible.',{status:404,headers:{...corsHeaders,'Content-Type':'text/plain; charset=utf-8'}});
    const binary=atob(m[2]); const bytes=new Uint8Array(binary.length); for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return new Response(bytes,{headers:{...corsHeaders,'Content-Type':m[1],'Cache-Control':'public, max-age=3600'}});
   }
   const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
   const destination=`https://francoferrari9595-cod.github.io/CatalogoFacil/?catalog=${encodeURIComponent(slug)}`;
   const imageUrl=image.startsWith('data:image/')?`${url.origin}/catalog-image/${encodeURIComponent(slug)}`:'';
   const title=esc(catalog.name||slug); const description=esc(catalog.description||`Mirá el catálogo de ${catalog.name||slug}`);
   const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url.origin}/share/${encodeURIComponent(slug)}">${imageUrl?`<meta property="og:image" content="${imageUrl}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`:''}<meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url=${destination}"><script>location.replace(${JSON.stringify(destination)})</script></head><body><p>Abriendo catálogo de ${title}… <a href="${destination}">Continuar</a></p></body></html>`;
   return new Response(html,{headers:{...corsHeaders,'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300'}});
  }
  const match = url.pathname.match(/^\/catalog\/([^/]+)$/);
  if (request.method === 'GET' && match) {
   const slug = cleanSlug(decodeURIComponent(match[1])); const index = await readIndex(env); const meta = index[slug];
   const editorRecovery = url.searchParams.get('editor') === '1';
   if (!editorRecovery && meta && meta.status && meta.status !== 'active') return json({ ok:false, error:meta.status==='pending'?'Este catálogo está pendiente de aprobación.':'Este catálogo está temporalmente desactivado.' }, 403);
   const raw = await env.CATALOGS.get(`catalog:${slug}`); if (!raw) return json({ ok:false, error:'Catálogo no encontrado.' },404);
   if (!editorRecovery && meta?.expiresAt && Date.now() >= Date.parse(meta.expiresAt)) return json({ ok:false, expired:true, error:'Este catálogo venció y está pausado.', supportWhatsApp:'2615407856', supportEmail:'francoferrari95@gmail.com' },403);
   let catalog; try { catalog=JSON.parse(raw); } catch { return new Response(raw,{status:200,headers:{...corsHeaders,'Content-Type':'application/json; charset=utf-8'}}); }
   catalog._subscription={createdAt:meta?.createdAt||null,expiresAt:meta?.expiresAt||null,warningDays:7};
   if(meta?.alertMessage)catalog._adminAlert=String(meta.alertMessage);else delete catalog._adminAlert;
   return json(catalog);
  }
  if (request.method === 'POST' && url.pathname === '/publish') {
   let body; try { body = await request.json(); } catch { return json({ok:false,error:'Datos inválidos.'},400); }
   const slug = cleanSlug(body?.slug || body?.catalog?.slug || body?.catalog?.name); const catalog = body?.catalog; const password=String(body?.password||'');
   if (!catalog || typeof catalog !== 'object') return json({ok:false,error:'Falta el catálogo.'},400);
   if (password.length < 8) return json({ok:false,error:'La contraseña del catálogo debe tener al menos 8 caracteres.'},400);
   const index=await readIndex(env); const meta=index[slug];
   if (meta) { const check=await hashPassword(password,meta.salt); if(check!==meta.passwordHash) return json({ok:false,error:'La contraseña no coincide. Este nombre ya pertenece a otro catálogo o la clave es incorrecta.'},403); }
   else { const salt=crypto.randomUUID(); index[slug]={slug,name:String(catalog.name||slug),status:'pending',salt,passwordHash:await hashPassword(password,salt),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),products:Array.isArray(catalog.products)?catalog.products.length:0}; }
   index[slug]={...index[slug],name:String(catalog.name||slug),status:index[slug].status||'active',updatedAt:new Date().toISOString(),products:Array.isArray(catalog.products)?catalog.products.length:0,description:String(catalog.description||'').slice(0,140),accent:/^#[0-9a-fA-F]{6}$/.test(String(catalog.accent||''))?String(catalog.accent):'',listed:catalog.listed!==false,hasImage:/^data:image\//.test(String(catalog.logo||catalog.cover||''))};
   const payload=JSON.stringify({...catalog,slug}); if(payload.length>24*1024*1024)return json({ok:false,error:'El catálogo supera el límite permitido. Reducí el tamaño de las imágenes.'},413);
   await env.CATALOGS.put(`catalog:${slug}`,payload); await writeIndex(env,index); return json({ok:true,slug,status:index[slug].status,message:index[slug].status==='pending'?'Catálogo enviado para aprobación administrativa.':'Catálogo publicado.'});
  }
  // Directorio público: lista solo catálogos activos, vigentes y que no pidieron ocultarse. No lee los catálogos completos.
  if (request.method === 'GET' && url.pathname === '/directory') {
   const norm = v => String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   const q = norm(url.searchParams.get('q')).trim().slice(0,60);
   const limit = Math.min(60, Math.max(1, parseInt(url.searchParams.get('limit')||'24',10)||24));
   const offset = Math.max(0, parseInt(url.searchParams.get('offset')||'0',10)||0);
   const now = Date.now(); const index = await readIndex(env);
   let list = Object.values(index).filter(x => x && x.slug && (x.status||'active')==='active' && x.listed!==false && !(x.expiresAt && now >= Date.parse(x.expiresAt)) && x.products!==0);
   if (q) list = list.filter(x => norm(`${x.name} ${x.description||''}`).includes(q));
   list.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
   const checkSlug = url.searchParams.get('check');
   let check = null;
   if (checkSlug) {
    const s = cleanSlug(checkSlug); const m = index[s]; let reason = 'visible';
    if (!m) reason = 'not-found'; else if ((m.status||'active')!=='active') reason = 'not-approved'; else if (m.listed===false) reason = 'hidden';
    else if (m.expiresAt && now >= Date.parse(m.expiresAt)) reason = 'expired'; else if (m.products===0) reason = 'empty';
    check = { slug:s, visible:reason==='visible', reason };
   }
   return json({ ok:true, v:2, check, total:list.length, offset, limit, catalogs:list.slice(offset,offset+limit).map(x=>({ slug:x.slug, name:x.name, description:x.description||'', products:Number(x.products||0), accent:x.accent||'', image:x.hasImage!==false })) });
  }
  if (request.method === 'POST' && url.pathname === '/ai/generate') {
   if (!env.GROQ_API_KEY) return json({ok:false,error:'Falta configurar GROQ_API_KEY en Cloudflare. Agregala una sola vez en Settings > Variables and Secrets como Secret y volvé a Deploy.'},503);
   let body; try { body=await request.json(); } catch { return json({ok:false,error:'La pregunta está vacía o tiene un formato inválido.'},400); }
   const prompt=String(body?.prompt||'').trim().slice(0,12000); if(!prompt)return json({ok:false,error:'Escribí una pregunta para la IA.'},400);
   const conversation=Array.isArray(body?.conversation)?body.conversation.filter(x=>x&&['user','assistant','model'].includes(x.role)&&typeof x.text==='string').slice(-12):[];
   const catalog=body?.catalog&&typeof body.catalog==='object'?body.catalog:{};
   const context=`Sos el asistente comercial de Catálogo Fácil. Respondé en español rioplatense, de forma práctica y clara. Ayudá con ideas de ventas, promociones, nombres, análisis y descripciones. Respondé con el nivel de detalle que necesite la consulta; las respuestas generales, opiniones, ideas, explicaciones y recomendaciones NO tienen límite de caracteres. Solo cuando el usuario solicite una descripción breve para un producto, esa descripción debe tener como máximo 200 caracteres. Nunca inventes precios, stock, marcas, materiales o características que no estén en los datos. Si la conversación anterior está incluida, mantené continuidad y respondé al seguimiento del usuario. Contexto del comercio (puede estar incompleto): ${JSON.stringify({name:catalog.name||'',description:catalog.description||'',categories:Array.isArray(catalog.categories)?catalog.categories.slice(0,40):[],products:Array.isArray(catalog.products)?catalog.products.slice(0,80):[]}).slice(0,14000)}\n\nProducto seleccionado por el usuario (si existe; usar sus datos para responder específicamente sobre ese producto y no confundirlo con otros): ${JSON.stringify(body?.selectedProduct&&typeof body.selectedProduct==='object'?body.selectedProduct:null)}`;
   const messages=[{role:'system',content:context},...conversation.map(x=>({role:x.role==='assistant'?'assistant':'user',content:x.text.slice(0,12000)})),{role:'user',content:prompt}];
   try {
    const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Authorization':'Bearer '+env.GROQ_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'openai/gpt-oss-120b',messages,temperature:0.7,max_tokens:8192,stream:false})});
    let data={};try{data=await response.json()}catch{}
    if(!response.ok){const detail=data?.error?.message||`GroqCloud respondió HTTP ${response.status}.`;return json({ok:false,error:detail},response.status>=500?502:response.status)}
    const text=String(data.choices?.[0]?.message?.content||'').trim();
    if(!text)return json({ok:false,error:'GroqCloud no devolvió texto. Intentá nuevamente.'},502);
    const finish=data.choices?.[0]?.finish_reason;
    return json({ok:true,text,truncated:finish==='length'});
   } catch(e) { return json({ok:false,error:'No se pudo conectar con GroqCloud. Revisá la conexión y la configuración de Cloudflare.'},502); }
  }
  if (url.pathname.startsWith('/admin/')) {
   if (!env.ADMIN_KEY) return json({ok:false,error:'ADMIN_KEY no está configurada como secreto en este Worker. En Cloudflare abrí Settings > Variables and Secrets, agregá ADMIN_KEY como Secret y volvé a Deploy.'},503);
   if (!adminOK(request,env)) return json({ok:false,error:'La clave administrativa no coincide con ADMIN_KEY. Revisá mayúsculas, espacios y que hayas desplegado el Worker después de guardar el secreto.'},401);
   const index=await readIndex(env);
   if(request.method==='GET'&&url.pathname==='/admin/catalogs') return json({ok:true,catalogs:Object.values(index).map(x=>({slug:x.slug,name:x.name,status:x.status||'active',products:x.products,createdAt:x.createdAt,updatedAt:x.updatedAt,expiresAt:x.expiresAt||null,alertMessage:x.alertMessage||''})).sort((a,b)=>String(b.createdAt||b.updatedAt).localeCompare(String(a.createdAt||a.updatedAt)))});
   if(request.method==='GET'&&url.pathname==='/admin/catalogs/export') { const slug=cleanSlug(url.searchParams.get('slug')); const raw=await env.CATALOGS.get(`catalog:${slug}`); if(!raw)return json({ok:false,error:index[slug]?'No se encontró el archivo del catálogo en el almacenamiento.':'No se encontró el catálogo ni su respaldo en el almacenamiento.'},404); let parsed;try{parsed=JSON.parse(raw)}catch{return json({ok:false,error:'El respaldo guardado no es un JSON válido; no se descargó para evitar entregar un archivo dañado.'},500)} return new Response(JSON.stringify(parsed,null,2),{status:200,headers:{...corsHeaders,'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="'+slug+'.json"','Access-Control-Expose-Headers':'Content-Disposition','Cache-Control':'no-store'}}); }
   if(request.method==='POST'&&url.pathname==='/admin/catalogs/expiry') { let b={};try{b=await request.json()}catch{} const slug=cleanSlug(b.slug); if(!index[slug])return json({ok:false,error:'No se encontró el catálogo.'},404); const date=String(b.expiresAt||''); let normalized=null; if(date){ if(/^\d{4}-\d{2}-\d{2}$/.test(date)){ const [y,m,d]=date.split('-').map(Number); const check=new Date(Date.UTC(y,m-1,d)); if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d)return json({ok:false,error:'Fecha de vencimiento inválida.'},400); normalized=new Date(`${date}T23:59:59.999-03:00`).toISOString(); } else { if(!Number.isFinite(Date.parse(date)))return json({ok:false,error:'Fecha de vencimiento inválida.'},400); normalized=new Date(date).toISOString(); } } index[slug].expiresAt=normalized; await writeIndex(env,index); return json({ok:true,expiresAt:index[slug].expiresAt,slug:index[slug].slug||slug}); }
   if(request.method==='POST'&&url.pathname==='/admin/catalogs/status') { let b={};try{b=await request.json()}catch{} const slug=cleanSlug(b.slug); if(!index[slug])return json({ok:false,error:'No se encontró el catálogo.'},404); const allowed=['active','disabled','rejected','pending']; index[slug].status=allowed.includes(b.status)?b.status:(b.active?'active':'disabled'); index[slug].updatedAt=new Date().toISOString(); await writeIndex(env,index); return json({ok:true,status:index[slug].status}); }
   if(request.method==='POST'&&url.pathname==='/admin/catalogs/alert') { let b={};try{b=await request.json()}catch{} const slug=cleanSlug(b.slug); if(!index[slug])return json({ok:false,error:'No se encontró el catálogo.'},404); const message=String(b.message||'').trim().slice(0,500); if(message)index[slug].alertMessage=message;else delete index[slug].alertMessage; index[slug].updatedAt=new Date().toISOString(); await writeIndex(env,index); return json({ok:true,slug,alertMessage:index[slug].alertMessage||''}); }
   if(request.method==='POST'&&url.pathname==='/admin/catalogs/delete') { let b={};try{b=await request.json()}catch{} const slug=cleanSlug(b.slug); if(!index[slug])return json({ok:false,error:'No se encontró el catálogo.'},404); await env.CATALOGS.delete(`catalog:${slug}`); delete index[slug]; await writeIndex(env,index); return json({ok:true}); }
   return json({ok:false,error:'Ruta administrativa no encontrada.'},404);
  }
  if(request.method==='GET'&&url.pathname==='/') return new Response('Catálogo Fácil Publisher OK',{headers:{...corsHeaders,'Content-Type':'text/plain; charset=utf-8'}});
  return json({ok:false,error:'Ruta no encontrada.'},404);
 }
};
