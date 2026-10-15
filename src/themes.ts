// Catálogo Fácil V83 · sistema único de temas.
// Un solo origen de verdad para el editor, la vista previa y el catálogo publicado:
// cada tema (clásico, personalizado o Claude) se convierte en variables CSS reales
// que se aplican igual en todas partes. Así lo que ves en el editor es lo que se publica.

export type ThemeTokens={id:string,name:string,group:string,desc:string,dark:boolean,bg:string,surface:string,surface2:string,line:string,muted:string,text:string,accent:string,accent2:string,hero1:string,hero2:string,display?:string,neon?:boolean,glass?:boolean,fx?:string};

const clamp=(n:number,a=0,b=255)=>Math.min(b,Math.max(a,n));
const parse=(hex:string):[number,number,number]=>{let h=String(hex||'').trim().replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');if(h.length>=8)h=h.slice(0,6);if(!/^[0-9a-f]{6}$/i.test(h))return [139,92,246];return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const toHex=(r:number,g:number,b:number)=>'#'+[r,g,b].map(v=>Math.round(clamp(v)).toString(16).padStart(2,'0')).join('');
export const mix=(a:string,b:string,t:number)=>{const x=parse(a),y=parse(b);return toHex(x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t)};
export const luminance=(hex:string)=>{const c=parse(hex).map(v=>{const s=v/255;return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4)});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
export const readableOn=(bg:string)=>luminance(bg)>0.38?'#16130f':'#ffffff';
export const DEFAULT_ACCENT='#8b5cf6';
const norm=(h:string)=>{const p=parse(h);return toHex(p[0],p[1],p[2])};
const SERIF="'Newsreader','Playfair Display',Georgia,'Times New Roman',serif";

// ───────────────────────── Temas Claude (102) ─────────────────────────
type CT=[string,string,string,boolean,string,string,string,string,string,string,string,string,string,string];
// id, nombre, descripción, oscuro, bg, surface, surface2, line, muted, text, accent, accent2, hero1, hero2
const CLAUDE:CT[]=[
 ['claude-arcilla','Claude Arcilla','Marfil cálido · arcilla · editorial',false,'#f5f3ec','#ffffff','#ece9de','#e2ded0','#6f6d66','#141413','#d97757','#c6613f','#33211a','#141413'],
 ['claude-marfil','Claude Marfil','Crema suave · bronce · refinado',false,'#f1ebdd','#fbf7ee','#e9e0cc','#d9ceb4','#7a6e58','#2b2418','#a9763a','#c99b57','#3a2d1a','#1d160b'],
 ['claude-medianoche','Claude Medianoche','Tinta cálida · arcilla · nocturno',true,'#141413','#1e1d1b','#272623','#3a3833','#a09d93','#f5f3ea','#d97757','#e99a7c','#3a2118','#141413'],
 ['claude-oliva','Claude Oliva','Verde salvia · natural · sereno',false,'#f1f1e6','#fbfbf3','#e4e6d3','#d2d6bb','#6a7156','#1f2418','#6f8553','#8aa06b','#2d3a21','#151c10'],
 ['claude-cielo','Claude Cielo','Azul tiza · limpio · confiable',false,'#eff3f6','#ffffff','#e1e9f0','#cfdae4','#61778a','#14202b','#4f87bd','#6a9bcc','#1b3248','#0e1b27'],
 ['claude-ciruela','Claude Ciruela','Rosa ciruela · sofisticado · cálido',false,'#f6f0f3','#ffffff','#eadde4','#dccbd5','#836a78','#2a1722','#9a4a78','#b9679a','#3b1b30','#1b0d17'],
 ['claude-arena','Claude Arena','Arena dorada · terroso · acogedor',false,'#f3ebdc','#fcf6e9','#eadcc3','#dac9a9','#81694a','#33261a','#c27a42','#d99660','#4a2e1a','#23150b'],
 ['claude-bosque','Claude Bosque','Verde profundo · calma · premium',true,'#0f1a15','#16251d','#1d3226','#2e4a3a','#9db8a6','#eef6ef','#8fc29a','#b4dcbb','#1f4130','#0b130f'],
 ['claude-grafito','Claude Grafito','Grafito cálido · arena · sobrio',true,'#1a1a19','#242423','#2e2e2c','#42423f','#a8a8a0','#f4f4ef','#e8dcc2','#f3ead6','#3a3935','#1a1a19'],
 ['claude-borgona','Claude Borgoña','Vino intenso · rosa antiguo · elegante',true,'#1c0e12','#2a161b','#381e25','#5a2f3a','#cfa0ab','#fcefef','#e27d8f','#f0a1ae','#5a1f2e','#1c0e12'],
 ['claude-niebla','Claude Niebla','Gris azulado · sereno · minimal',false,'#eceef0','#fafbfc','#dfe3e7','#ccd2d8','#667380','#1c2228','#55708a','#7a95ad','#2a3a49','#151d25'],
 ['claude-aurora','Claude Aurora','Noche azul · turquesa · violeta',true,'#0c1320','#131d2e','#1a2740','#2c3f5f','#96abc9','#eef4ff','#78d6c2','#a88bf0','#1d3b52','#2a1c4d'],
 ['claude-terracota','Claude Terracota','Barro oscuro · coral cálido · intenso',true,'#26140e','#351e15','#45281c','#6b4030','#d6aa94','#fff1e8','#f0a27b','#ffbf9f','#7a3a22','#26140e'],
 ['claude-lavanda','Claude Lavanda','Lila suave · delicado · moderno',false,'#f3f1f9','#ffffff','#e6e2f2','#d5cfe6','#756f92','#1f1a33','#7a66b8','#9b89d3','#2d2452','#15102b'],
 ['claude-dorado','Claude Dorado','Tinta · dorado · lujo discreto',true,'#14120d','#1e1b14','#2a261b','#4a4230','#b5a98a','#f7efd9','#d6ac5c','#ecc982','#4a3a16','#14120d']
];
const BASE:ThemeTokens[]=CLAUDE.map(([id,name,desc,dark,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2])=>({id,name,group:dark?'Oscuros':'Claros',desc,dark,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2,display:SERIF}));

// Neón oscuro: fondo casi negro, bordes y brillos de color
const neonDark=(id:string,name:string,desc:string,accent:string,accent2:string):ThemeTokens=>({id,name,desc,group:'Neón oscuro',dark:true,neon:true,display:SERIF,
 bg:mix('#05050a',accent,0.06),surface:mix('#0c0c14',accent,0.07),surface2:mix('#13131d',accent,0.11),line:mix('#20202e',accent,0.34),muted:mix('#9a9cb8',accent,0.14),text:'#f4f6ff',accent,accent2,hero1:mix('#0a0a12',accent,0.36),hero2:mix('#05050a',accent2,0.14)});
// Neón claro: base blanca luminosa con acento vibrante
const neonLight=(id:string,name:string,desc:string,accent:string,accent2:string):ThemeTokens=>({id,name,desc,group:'Neón claro',dark:false,neon:true,display:SERIF,
 bg:mix('#ffffff',accent,0.055),surface:'#ffffff',surface2:mix('#ffffff',accent,0.1),line:mix('#e4e4ef',accent,0.4),muted:'#666a82',text:'#13132a',accent,accent2,hero1:mix('#13132a',accent,0.5),hero2:'#0a0a1c'});
// Cristal (glassmorphism): superficies translúcidas sobre un fondo con luz de color
const glassT=(id:string,name:string,desc:string,dark:boolean,bg:string,surface:string,surface2:string,line:string,muted:string,text:string,accent:string,accent2:string,hero1:string,hero2:string):ThemeTokens=>({id,name,desc,group:'Cristal',dark,glass:true,display:SERIF,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2});

const EXTRA:ThemeTokens[]=[
 ['claude-obsidiana','Claude Obsidiana','Negro profundo · oro rosado · lujo','#0b0a0a','#161414','#201c1c','#3b3434','#a89c9c','#f6eeee','#e3b7a0','#f3d2c2','#3d2a24','#0b0a0a'],
 ['claude-cobre','Claude Cobre','Cobre cálido · madera oscura · artesanal','#1b120c','#271a11','#33221a','#583b28','#c8a58c','#fbefe3','#d9894f','#efb07f','#6a3a1c','#1b120c']
].map(([id,name,desc,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2])=>({id,name,desc,group:'Oscuros',dark:true,display:SERIF,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2} as ThemeTokens)).concat([
 neonDark('claude-neon-cian','Claude Neón Cian','Negro · cian eléctrico · tecnológico','#22e6ff','#7af3ff'),
 neonDark('claude-neon-magenta','Claude Neón Magenta','Negro · magenta intenso · nocturno','#ff2bd6','#ff8ae9'),
 neonDark('claude-neon-violeta','Claude Neón Violeta','Negro · violeta ultravioleta · futurista','#a45bff','#cfa4ff'),
 neonDark('claude-neon-lima','Claude Neón Lima','Negro · verde lima · energía','#b6ff2e','#e0ff8a'),
 neonDark('claude-neon-fuego','Claude Neón Fuego','Negro · naranja fuego · audaz','#ff7a1a','#ffb067'),
 neonDark('claude-neon-electrico','Claude Neón Eléctrico','Negro · azul eléctrico · limpio','#3d7bff','#8fb3ff'),
 neonDark('claude-neon-rosa','Claude Neón Rosa','Negro · rosa chicle · divertido','#ff5fa8','#ffa3cd'),
 neonDark('claude-neon-esmeralda','Claude Neón Esmeralda','Negro · verde esmeralda · matrix','#19f08f','#7bffc3'),
 neonLight('claude-luz-cian','Claude Luz Cian','Blanco · cian vibrante · fresco','#00b8d9','#38d6f0'),
 neonLight('claude-luz-magenta','Claude Luz Magenta','Blanco · magenta vibrante · moderno','#e0189f','#f263c8'),
 neonLight('claude-luz-violeta','Claude Luz Violeta','Blanco · violeta eléctrico · creativo','#7a3df0','#a47bff'),
 neonLight('claude-luz-lima','Claude Luz Lima','Blanco · lima vivo · deportivo','#6bd400','#a2f03c'),
 neonLight('claude-luz-coral','Claude Luz Coral','Blanco · coral neón · cálido','#ff4f5e','#ff8791'),
 neonLight('claude-luz-azul','Claude Luz Azul','Blanco · azul brillante · confiable','#1f6bff','#6a9cff'),
 neonLight('claude-luz-menta','Claude Luz Menta','Blanco · menta neón · liviano','#00c98a','#4de6b4'),
 glassT('claude-cristal-noche','Claude Cristal Noche','Cristal oscuro · azul profundo · elegante',true,'#070b1a','rgba(255,255,255,.07)','rgba(255,255,255,.1)','rgba(255,255,255,.16)','#a9b6d8','#f1f5ff','#7ea2ff','#b79bff','#22346e','#070b1a'),
 glassT('claude-cristal-aurora','Claude Cristal Aurora','Cristal oscuro · turquesa y violeta',true,'#080f18','rgba(255,255,255,.07)','rgba(255,255,255,.1)','rgba(255,255,255,.16)','#a3bcc9','#effaff','#5fe3c8','#a98bff','#14464f','#1d1442'),
 glassT('claude-cristal-perla','Claude Cristal Perla','Cristal claro · perla · delicado',false,'#e8ecf6','rgba(255,255,255,.62)','rgba(255,255,255,.5)','rgba(110,122,170,.26)','#5f6a88','#1a2038','#5b6cf2','#9a7cf5','#2a3368','#141a3a'),
 glassT('claude-cristal-ambar','Claude Cristal Ámbar','Cristal oscuro · ámbar · cálido',true,'#150e08','rgba(255,255,255,.07)','rgba(255,255,255,.1)','rgba(255,255,255,.16)','#cdb79d','#fff4e6','#ffb454','#ff8a5c','#5a3414','#150e08')
]);

// ───────────────────── V83.2 · 46 temas nuevos ─────────────────────
// Neón con vida: 'fx' define cómo se enciende/apaga el brillo (flicker, onoff, pulse, buzz, ignite).
// Neón estático: brillo fijo, sin parpadeo ni animación de encendido
const neonFx=(id:string,name:string,desc:string,accent:string,accent2:string,_fx?:string):ThemeTokens=>neonDark(id,name,desc,accent,accent2);
// Neón dúo: dos colores de luz (acento y acento 2) con degradado en la portada
const neonDuo=(id:string,name:string,desc:string,accent:string,accent2:string,_fx?:string):ThemeTokens=>({id,name,desc,group:'Neón dúo',dark:true,neon:true,display:SERIF,
 bg:mix(mix('#05050c',accent,0.05),accent2,0.05),surface:mix(mix('#0b0b15',accent,0.05),accent2,0.06),surface2:mix(mix('#12121e',accent,0.08),accent2,0.09),line:mix(mix('#20202f',accent,0.3),accent2,0.2),muted:mix(mix('#9a9cb8',accent,0.1),accent2,0.1),text:'#f5f6ff',accent,accent2,hero1:mix('#0a0a14',accent,0.42),hero2:mix('#05050c',accent2,0.36)});
// Temas profesionales: [id, nombre, descripción, oscuro, bg, surface, surface2, line, muted, text, accent, accent2, hero1, hero2]
const PRO:[string,string,string,boolean,string,string,string,string,string,string,string,string,string,string][]=[
 ['claude-porcelana','Claude Porcelana','Blanco hueso · azul petróleo · pulcro',false,'#f6f5f1','#ffffff','#ecebe5','#dcdad0','#6b6a64','#1d1d1b','#2f4858','#4f7a94','#1f3340','#10191f'],
 ['claude-rosa-polvo','Claude Rosa Polvo','Rosa empolvado · cálido · delicado',false,'#f8efee','#fffaf9','#f0e0de','#e4cfcc','#86686a','#2e1b1d','#c0636f','#d98a94','#4a2228','#1f0e11'],
 ['claude-salvia','Claude Salvia Suave','Verde salvia · natural · tranquilo',false,'#eef2ec','#fbfdf9','#e0e8dc','#cdd9c7','#62705d','#1c2619','#5f8a5a','#85ac80','#25381f','#121c0f'],
 ['claude-oceano-claro','Claude Océano Claro','Celeste marino · limpio · confiable',false,'#edf5f8','#ffffff','#dfedf2','#c8dde6','#587585','#10252f','#0f7fa8','#3ba3c8','#123c50','#08202b'],
 ['claude-durazno','Claude Durazno','Durazno · naranja suave · amable',false,'#fdf1e7','#fffaf4','#f7e2d0','#ecd2bb','#8a6a52','#36200f','#e07b39','#f09c63','#5a2f12','#28130a'],
 ['claude-lila-algodon','Claude Lila Algodón','Lila · violeta suave · creativo',false,'#f4f0fa','#ffffff','#e8e0f4','#d8cdea','#7a6d98','#231a3a','#8a5fd1','#a98ae6','#34205a','#170f2b'],
 ['claude-limon','Claude Limón Fresco','Lima pálido · fresco · juvenil',false,'#f7f8e8','#fefff4','#ecefcf','#dce1b3','#747a4a','#262b0f','#8da000','#b0c32a','#3a4410','#1a1f07'],
 ['claude-kraft','Claude Papel Kraft','Cartón · marrón natural · artesanal',false,'#efe6d6','#f9f3e6','#e3d5bb','#d1bf9f','#7d6a4d','#2d2417','#9c6b3a','#bf8d57','#402c16','#1d130a'],
 ['claude-marfil-marino','Claude Marfil y Marino','Marfil · azul marino · clásico elegante',false,'#f3f1ea','#fffdf8','#e8e5d9','#d8d3c2','#6d6a5d','#14213d','#1f3a6b','#3f62a3','#14213d','#0a1226'],
 ['claude-nordico','Claude Blanco Nórdico','Blanco puro · azul cielo · minimal',false,'#fafbfc','#ffffff','#eef1f4','#dde2e8','#6b7684','#111827','#3b82f6','#60a5fa','#1e3a5f','#0f1c30'],
 ['claude-pizarra','Claude Pizarra','Gris pizarra · azul claro · tecnológico',true,'#12161c','#1a2029','#232b36','#36404d','#9aa6b5','#eef2f7','#6cb0ff','#9ccaff','#1c3250','#0e1218'],
 ['claude-indigo','Claude Tinta Índigo','Índigo profundo · lavanda · sofisticado',true,'#0e1124','#161a33','#1e2342','#333a68','#9aa3d1','#eef0ff','#7c8cff','#a9b4ff','#25306b','#0b0d1e'],
 ['claude-cafe-negro','Claude Café Negro','Café oscuro · caramelo · acogedor',true,'#17110d','#211913','#2c221a','#463829','#b9a58f','#f6ece0','#c68b59','#e0aa7b','#4b2f1b','#17110d'],
 ['claude-pino','Claude Verde Pino','Verde pino · menta · natural premium',true,'#0c1712','#12241b','#193225','#2a4a38','#93b7a3','#ebf7ef','#4fd1a1','#86e6c2','#14493a','#0a1410'],
 ['claude-vino-noche','Claude Vino Noche','Burdeos nocturno · coral rosado · pasional',true,'#190c10','#251318','#321a21','#55303a','#cd9aa6','#fff0f2','#ff6f87','#ff9fb0','#5c1e2d','#190c10'],
 ['claude-acero','Claude Acero Azul','Acero azulado · cian · industrial limpio',true,'#0f1720','#172230','#1f2e40','#34485f','#9db2c8','#eef5fc','#4aa3df','#7fc0ee','#1b4166','#0b1119'],
 ['claude-ebano-cobre','Claude Ébano y Cobre','Negro ébano · cobre · artesanal premium',true,'#131110','#1d1a18','#282421','#463f39','#b3a79d','#f5efe8','#d98a5c','#efab80','#4a2c1c','#131110'],
 ['claude-violeta-noche','Claude Medianoche Violeta','Violeta noche · lila · creativo oscuro',true,'#130e1f','#1c1530','#261d40','#433560','#b3a3d6','#f4efff','#a98bff','#c9b6ff','#3b2670','#130e1f'],
 ['claude-negro-plata','Claude Negro y Plata','Negro profundo · plata · lujo moderno',true,'#0a0a0b','#151517','#1f1f22','#3a3a40','#a7a7b0','#f4f4f6','#cfd3dc','#eceff5','#34363d','#0a0a0b'],
 ['claude-esmeralda-real','Claude Esmeralda Real','Verde botella · oro viejo · distinguido',true,'#07140f','#0f2219','#163024','#2a4d3b','#9fc2ad','#eef8f1','#d4b25c','#ecd085','#14452f','#07140f']
];
const PRO_THEMES:ThemeTokens[]=PRO.map(([id,name,desc,dark,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2])=>({id,name,desc,group:dark?'Oscuros':'Claros',dark,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2,display:SERIF}));
const MORE:ThemeTokens[]=[
 ...PRO_THEMES,
 glassT('claude-cristal-oceano','Claude Cristal Océano','Cristal oscuro · cian y azul · profundo',true,'#06121a','rgba(255,255,255,.07)','rgba(255,255,255,.1)','rgba(255,255,255,.16)','#9fc3d4','#ecf9ff','#4fd8ff','#6f9bff','#0c4a63','#071a2b'),
 glassT('claude-cristal-rosa','Claude Cristal Rosa','Cristal claro · rosa y lila · suave',false,'#f6e8f0','rgba(255,255,255,.62)','rgba(255,255,255,.5)','rgba(190,110,150,.28)','#7a5a70','#2a1424','#e0568f','#a06af0','#6a2250','#2a1024'),
 glassT('claude-cristal-esmeralda','Claude Cristal Esmeralda','Cristal oscuro · verde agua y cian',true,'#06130e','rgba(255,255,255,.07)','rgba(255,255,255,.1)','rgba(255,255,255,.16)','#9cc7b5','#ecfff7','#44e6a3','#4fd0ff','#0f5a41','#061a2a'),
 glassT('claude-cristal-humo','Claude Cristal Humo','Cristal oscuro · gris humo · sobrio',true,'#0e0f13','rgba(255,255,255,.07)','rgba(255,255,255,.1)','rgba(255,255,255,.16)','#aab0c4','#f3f5fb','#c4cbe0','#8fa0ff','#2d3142','#0e0f13'),
 // Neón con efectos de encendido, apagado y titileo
 neonFx('claude-neon-tubo-rojo','Claude Neón Tubo Rojo','Letrero rojo de bar','#ff2d4a','#ff8a98','flicker'),
 neonFx('claude-neon-bar-ambar','Claude Neón Bar Ámbar','Ámbar de cantina','#ffb02e','#ffd78a','onoff'),
 neonFx('claude-neon-pulso-cian','Claude Neón Pulso Cian','Cian que respira','#00f0ff','#8af8ff','pulse'),
 neonFx('claude-neon-flamenco','Claude Neón Flamenco','Rosa flamenconte','#ff4fa3','#ffa6d0','flicker'),
 neonFx('claude-neon-toxico','Claude Neón Verde Tóxico','Verde ácido','#39ff14','#b6ff9e','buzz'),
 neonFx('claude-neon-hielo','Claude Neón Azul Hielo','Azul glacial','#5cc8ff','#b5e6ff','pulse'),
 neonFx('claude-neon-club','Claude Neón Club Violeta','Violeta de discoteca','#b24bff','#dba6ff','onoff'),
 neonFx('claude-neon-lava','Claude Neón Lava','Naranja volcán','#ff5a1f','#ffa273','flicker'),
 neonFx('claude-neon-taxi','Claude Neón Amarillo Taxi','Amarillo urbano','#ffe600','#fff48a','buzz'),
 neonFx('claude-neon-tropical','Claude Neón Turquesa Tropical','Turquesa vivo','#00ffc6','#8bffe2','ignite'),
 neonFx('claude-neon-rubi','Claude Neón Rubí','Rojo rubí','#ff1744','#ff7a93','pulse'),
 neonFx('claude-neon-lila-pop','Claude Neón Lila Pop','Lila pop','#d17bff','#ecc2ff','ignite'),
 neonFx('claude-neon-cobalto','Claude Neón Cobalto','Azul cobalto','#2f6bff','#86a9ff','buzz'),
 neonFx('claude-neon-laser-menta','Claude Neón Láser Menta','Menta lásernte','#46ffb0','#a7ffd9','flicker'),
 neonFx('claude-neon-tubo-blanco','Claude Neón Tubo Blanco','Blanco frío','#e8f4ff','#ffffff','onoff'),
 neonFx('claude-neon-casino','Claude Neón Casino Dorado','Dorado de casino','#ffcc33','#ffe28a','pulse'),
 neonDuo('claude-duo-cyberpunk','Claude Dúo Cyberpunk','Cian + magentante','#00f0ff','#ff2bd6','flicker'),
 neonDuo('claude-duo-synthwave','Claude Dúo Synthwave','Rosa + azul retro · latido','#ff3cac','#2b86c5','pulse'),
 neonDuo('claude-duo-miami','Claude Dúo Miami Night','Rosa + turquesa','#ff6ec7','#00e5ff','ignite'),
 neonDuo('claude-duo-tokyo','Claude Dúo Tokyo Drift','Rojo + aqua','#ff2e63','#08d9d6','onoff'),
 neonDuo('claude-duo-toxic','Claude Dúo Toxic','Lima + violeta','#b6ff00','#a100ff','buzz'),
 neonDuo('claude-duo-inferno','Claude Dúo Inferno','Naranja + azul eléctriconte','#ff7a00','#2d6bff','flicker')
];

// ───────────────────── V83.3 · 20 temas más ─────────────────────
const PRO2:[string,string,string,boolean,string,string,string,string,string,string,string,string,string,string][]=[['claude-algodon', 'Claude Algodón de Azúcar', 'Rosa pastel · dulce · tiendas de moda y regalos', false, '#fdf2f8', '#ffffff', '#fbe2ef', '#f3cfe0', '#8a6479', '#3a1730', '#ec4899', '#f472b6', '#5c1f45', '#26101f'], ['claude-menta-helada', 'Claude Menta Helada', 'Verde menta · fresco · saludable', false, '#ecf8f4', '#fbfffd', '#d9f0e8', '#c2e4d8', '#55766a', '#0f2a22', '#10b981', '#34d399', '#0f4a3a', '#07201a'], ['claude-trigo', 'Claude Trigo', 'Dorado trigo · panadería y gastronomía', false, '#f8f1e1', '#fffaf0', '#efe3c5', '#e1d1a8', '#85713f', '#33280e', '#c8962c', '#e2b34f', '#4d3a10', '#211a08'], ['claude-cielo-despejado', 'Claude Cielo Despejado', 'Azul cielo · confiable · corporativo', false, '#eaf4ff', '#ffffff', '#d8e9fb', '#c1d9f1', '#5a7796', '#0f2540', '#2563eb', '#4f86f7', '#17356b', '#0b1a38'], ['claude-terracota', 'Claude Terracota Clara', 'Arcilla cálida · artesanal · hogar', false, '#faeee6', '#fffaf6', '#f3dccd', '#e8c8b4', '#8c6450', '#3b1f12', '#c2562e', '#de7a52', '#5c2512', '#26100a'], ['claude-noche-real', 'Claude Noche Azul Real', 'Azul real profundo · premium', true, '#0a1230', '#111b44', '#18245a', '#2c3a7e', '#9fb0e8', '#eef2ff', '#4f7cff', '#86a5ff', '#1b2f80', '#070c22'], ['claude-carbon-naranja', 'Claude Carbón y Naranja', 'Negro carbón · naranja vivo · potente', true, '#121212', '#1c1c1c', '#262626', '#3f3f3f', '#a8a8a8', '#f5f5f5', '#ff8a1f', '#ffae5c', '#4a2a0a', '#121212'], ['claude-selva', 'Claude Selva', 'Verde selva · lima · natural intenso', true, '#08160f', '#0f2418', '#163322', '#285240', '#8fbfa0', '#eafaef', '#a3e635', '#c4f06a', '#1c4a1a', '#08160f'], ['claude-rosa-nocturna', 'Claude Rosa Nocturna', 'Berenjena oscura · rosa · glamour', true, '#1a0d16', '#27141f', '#351b2a', '#5a2f47', '#d6a0bd', '#fff0f7', '#f472b6', '#f9a8d4', '#5c1f45', '#1a0d16'], ['claude-mar-profundo', 'Claude Mar Profundo', 'Azul petróleo · turquesa · marino', true, '#061a22', '#0c2833', '#12394a', '#235a72', '#8cc0d4', '#e9faff', '#22c1dc', '#67dcef', '#0f4f63', '#061a22'], ['claude-cuero', 'Claude Cuero', 'Cuero marrón · cobre suave · clásico', true, '#1d1410', '#2a1d16', '#38281e', '#5a4332', '#c4a98f', '#fbf0e3', '#b7793e', '#d79b62', '#4f3018', '#1d1410']];
const PRO2_THEMES:ThemeTokens[]=PRO2.map(([id,name,desc,dark,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2])=>({id,name,desc,group:dark?'Oscuros':'Claros',dark,bg,surface,surface2,line,muted,text,accent,accent2,hero1,hero2,display:SERIF}));
const MORE2:ThemeTokens[]=[
 ...PRO2_THEMES,
 glassT('claude-cristal-rubi','Claude Cristal Rubí','Cristal oscuro · rubí y ámbar',true,'#14070b','rgba(255,255,255,.07)','rgba(255,255,255,.1)','rgba(255,255,255,.16)','#d8a3ad','#fff0f2','#ff5d7a','#ffa94d','#5a1425','#14070b'),
 glassT('claude-cristal-lila','Claude Cristal Lila','Cristal claro · lila y rosa',false,'#efe8fb','rgba(255,255,255,.62)','rgba(255,255,255,.5)','rgba(139,92,246,.26)','#6f5a96','#231a3a','#8b5cf6','#ec6fd1','#3b2670','#170f2b'),
 glassT('claude-cristal-cielo','Claude Cristal Cielo','Cristal claro · azul cielo',false,'#e6f1fb','rgba(255,255,255,.64)','rgba(255,255,255,.5)','rgba(47,128,237,.26)','#557391','#0f2540','#2f80ed','#56ccf2','#17356b','#0b1a38'),
 neonFx('claude-neon-sakura','Claude Neón Sakura','Rosa cerezo luminoso','#ff7eb6','#ffc2dc'),
 neonFx('claude-neon-mandarina','Claude Neón Mandarina','Naranja cítrico luminoso','#ff9500','#ffc266'),
 neonDuo('claude-duo-sunset','Claude Dúo Sunset','Rojo coral + ámbar · atardecer','#ff5f6d','#ffc371'),
 neonDuo('claude-duo-galaxia','Claude Dúo Galaxia','Violeta + magenta · espacial','#7b2ff7','#f107a3'),
 neonDuo('claude-duo-hielo-fuego','Claude Dúo Hielo y Fuego','Cian + rojo · contraste extremo','#00d4ff','#ff3b30'),
 neonDuo('claude-duo-lima-cian','Claude Dúo Lima y Cian','Lima eléctrico + cian · fresco','#a8ff3e','#00e5ff')
];
export const CLAUDE_THEMES:ThemeTokens[]=[...BASE,...EXTRA,...MORE,...MORE2];
export const THEME_GROUPS=['Todos','Claros','Oscuros','Neón oscuro','Neón dúo','Neón claro','Cristal'];
const CLAUDE_MAP:Record<string,ThemeTokens>=Object.fromEntries(CLAUDE_THEMES.map(t=>[t.id,t]));

// ───────────────────── Temas heredados (paletas originales) ─────────────────────
// [bg, surface, surface2, line, muted, text, hero, accent]
const LEGACY:Record<string,string[]>={
  'classic':["#f5f3ee", "#fff", "#f0ede6", "#ddd7ca", "#706b61", "#25221d", "#ded8cc", "#8a5a2b"],
  'luxury':["#080807", "#12110f", "#1b1812", "#3a3325", "#a69a82", "#f6ead0", "#211b11", "#d7ad55"],
  'neon':["#06090d", "#0b1117", "#101923", "#183a43", "#7fa3ad", "#effcff", "#0d1720", "#31e7d4"],
  'minimal':["#fafafa", "#fff", "#f3f3f3", "#e1e1e1", "#707070", "#181818", "#ececec", "#222"],
  'food':["#1b0e0a", "#24130e", "#311912", "#5a3021", "#c39b88", "#fff4ec", "#4b2115", "#ff7a45"],
  'glass':["#0b0e18", "#141a29aa", "#1b2335aa", "#7180a844", "#aab4ce", "#f4f7ff", "#1b2540", "#8b7cff"],
  'market':["#f4f7f4", "#fff", "#eef4ef", "#d5ded7", "#637268", "#172019", "#dfe9e1", "#1f8f5b"],
  'vintage':["#f1e5ce", "#fbf2df", "#ead8b8", "#cdbb99", "#77654a", "#3e3021", "#d8c29b", "#9a4f2d"],
  'pastel':["#fff7fb", "#fff", "#fff0f6", "#f1d5e2", "#8b7280", "#332934", "#f7ddea", "#d85d9b"],
  'industrial':["#111315", "#191c1e", "#22272a", "#3a4246", "#9ba5aa", "#f1f4f5", "#292f32", "#e8a62c"],
  'botanical':["#f1f5ed", "#fff", "#e5eddf", "#cbd8c3", "#657260", "#233021", "#d9e5d1", "#4c8a52"],
  'bold':["#160b22", "#241035", "#32164a", "#66308c", "#c1a5cf", "#fff7ff", "#3c1b58", "#ff4f9a"],
  'ocean':["#071c2c", "#0d2b40", "#123b54", "#235d79", "#9bc7dc", "#f0fbff", "#10415c", "#25bde0"],
  'sunset':["#281018", "#401b27", "#572431", "#8b3e42", "#f0b4a0", "#fff4ec", "#7a302d", "#ff8a50"],
  'lavender':["#171126", "#251b3b", "#352650", "#5d477f", "#c8b8e8", "#fbf7ff", "#392755", "#b69cff"],
  'candy':["#250d25", "#3b1538", "#511c4b", "#8b3b83", "#f0b5e6", "#fff5ff", "#65265c", "#ff62c8"],
  'emerald':["#071d18", "#103027", "#174335", "#2a7056", "#a3d5bd", "#f0fff7", "#18513c", "#48d597"],
  'coral':["#2b1515", "#422020", "#592c2a", "#98534c", "#f1b8aa", "#fff8f2", "#783b35", "#ff806f"],
  'arctic':["#edf7fb", "#fff", "#e2f1f7", "#c4e0eb", "#557582", "#16323e", "#d2ebf5", "#168bb5"],
  'midnight':["#080e20", "#111b33", "#1a2846", "#344b76", "#a2b6df", "#f3f6ff", "#1b2c50", "#88aaff"],
  'royal':["#170d2c", "#261643", "#372057", "#64438d", "#c6b0e9", "#fff8eb", "#3e2864", "#e4c46c"],
  'desert':["#f4e6d2", "#fff6e9", "#ead4b6", "#cfad88", "#80634b", "#402d20", "#dec09a", "#b9633d"],
  'rose':["#fff5f6", "#fff", "#f9e5e9", "#edc8d0", "#916c78", "#452b35", "#f2d5dc", "#c87891"],
  'cyber':["#070b08", "#101a12", "#17251a", "#2f6339", "#9ccba4", "#f2fff2", "#17341d", "#9cff3b"],
  'mono':["#101010", "#1b1b1b", "#282828", "#494949", "#b4b4b4", "#fff", "#303030", "#d8d8d8"],
  'citrus':["#171c08", "#252e0e", "#354217", "#667c2c", "#c5d69a", "#fbffe9", "#43551a", "#d6f044"],
  'coffee':["#211710", "#33251b", "#463326", "#72533b", "#cbb39a", "#fff4e4", "#5b402b", "#d79a60"],
  'berry':["#210b1a", "#351027", "#4b1738", "#80345f", "#dfa8c7", "#fff3fa", "#5d1b42", "#ed5e9f"],
  'sky':["#f0f9ff", "#fff", "#e2f3ff", "#c1e2f7", "#53758c", "#173348", "#d3edff", "#249fe0"],
  'terra':["#211713", "#34231d", "#493027", "#805543", "#d0ad99", "#fff4e9", "#67412f", "#db8059"],
  'aurora':["#08131b", "#10222c", "#18313c", "#326d70", "#a4d9d1", "#f2ffff", "#183b45", "#70e5b4"],
  'pearl':["#f7f2e9", "#fffdf8", "#eee5d5", "#d9cbb2", "#827766", "#30291f", "#e8dcc6", "#b89a65"],
  'carbon':["#111315", "#1a1e21", "#252b2f", "#444d52", "#adb8bd", "#f7fafb", "#2d3539", "#ff8d32"]
};
// Temas neón que existían sin paleta propia: [fondo, acento]
const NEON:Record<string,string[]>={
  'neon-pink':["#12060f", "#ff4fb8"],
  'neon-blue':["#050b18", "#3da5ff"],
  'neon-purple':["#0d0618", "#b36bff"],
  'neon-lime':["#0a1005", "#b6ff3b"],
  'neon-cyber':["#05100f", "#27f5d6"],
  'glass-neon':["#090c1a", "#7f8cff"],
  'holographic':["#0b0d1c", "#9fe7ff"],
  'electric':["#06081a", "#4d7cff"],
  'matrix':["#030a05", "#2dff6b"],
  'ultraviolet':["#0b0517", "#9a5cff"]
};
// Temas por rubro: [grupo, fondo, texto, acento]
const CUSTOM:Record<string,string[]>={
  'custom-fashion-editorial':["Moda", "#f4e8df", "#201714", "#b75d45"],
  'custom-boutique-noir':["Moda", "#151218", "#f7eaf3", "#d8a2bc"],
  'custom-denim':["Moda", "#172b45", "#e8f0f7", "#69a9dc"],
  'custom-streetwear':["Moda", "#191919", "#f4f4f4", "#d5ff00"],
  'custom-runway':["Moda", "#f6f0eb", "#211b20", "#a42a50"],
  'custom-sastreria':["Moda", "#e7dfd0", "#292821", "#88734f"],
  'custom-seda':["Moda", "#f8edf0", "#46323b", "#d5a4b5"],
  'custom-lino':["Moda", "#eee5d5", "#3e4639", "#a3a77b"],
  'custom-sport-pro':["Moda", "#101b26", "#f5f8fc", "#ff653b"],
  'custom-active-lime':["Moda", "#1b2417", "#f2ffe6", "#b7ef4a"],
  'custom-basket':["Moda", "#221c18", "#f8eee1", "#d99b5b"],
  'custom-yoga-calm':["Moda", "#e9eee8", "#33473c", "#91b59b"],
  'custom-urban-concrete':["Moda", "#292b30", "#f1f1f1", "#b5bbc5"],
  'custom-skate-retro':["Moda", "#f0e8d6", "#2b2925", "#df5e3e"],
  'custom-luxury-cream':["Moda", "#f7f0e2", "#30291d", "#ad8953"],
  'custom-gold-leaf':["Moda", "#17130d", "#f8e8bd", "#d5ad52"],
  'custom-diamond':["Moda", "#eef2f8", "#24324a", "#9db8df"],
  'custom-velvet':["Moda", "#21131d", "#f8e7ef", "#b76b91"],
  'custom-royal-blue':["Moda", "#101d43", "#f2f5ff", "#6f8fe8"],
  'custom-ruby':["Moda", "#2a1017", "#fff0f2", "#dc4665"],
  'custom-bistro':["Gastronomía", "#191919", "#f4f4f4", "#d5ff00"],
  'custom-panaderia':["Gastronomía", "#f6f0eb", "#211b20", "#a42a50"],
  'custom-pasteleria':["Gastronomía", "#e7dfd0", "#292821", "#88734f"],
  'custom-cafe-de-especialidad':["Gastronomía", "#f8edf0", "#46323b", "#d5a4b5"],
  'custom-pizzeria':["Gastronomía", "#eee5d5", "#3e4639", "#a3a77b"],
  'custom-sushi-zen':["Gastronomía", "#101b26", "#f5f8fc", "#ff653b"],
  'custom-vegano':["Gastronomía", "#1b2417", "#f2ffe6", "#b7ef4a"],
  'custom-organico':["Gastronomía", "#221c18", "#f8eee1", "#d99b5b"],
  'custom-vino-y-queso':["Gastronomía", "#e9eee8", "#33473c", "#91b59b"],
  'custom-heladeria':["Gastronomía", "#292b30", "#f1f1f1", "#b5bbc5"],
  'custom-food-truck':["Gastronomía", "#f0e8d6", "#2b2925", "#df5e3e"],
  'custom-brunch':["Gastronomía", "#f7f0e2", "#30291d", "#ad8953"],
  'custom-parrilla':["Gastronomía", "#17130d", "#f8e8bd", "#d5ad52"],
  'custom-mariscos':["Gastronomía", "#eef2f8", "#24324a", "#9db8df"],
  'custom-te-y-matcha':["Gastronomía", "#21131d", "#f8e7ef", "#b76b91"],
  'custom-mercado-fresco':["Gastronomía", "#101d43", "#f2f5ff", "#6f8fe8"],
  'custom-delicatessen':["Gastronomía", "#2a1017", "#fff0f2", "#dc4665"],
  'custom-gourmet':["Gastronomía", "#f4e8df", "#201714", "#b75d45"],
  'custom-cocktail-bar':["Gastronomía", "#151218", "#f7eaf3", "#d8a2bc"],
  'custom-chocolate':["Gastronomía", "#172b45", "#e8f0f7", "#69a9dc"],
  'custom-tech-minimal':["Tecnología", "#f8edf0", "#46323b", "#d5a4b5"],
  'custom-digital-dark':["Tecnología", "#eee5d5", "#3e4639", "#a3a77b"],
  'custom-ai-future':["Tecnología", "#101b26", "#f5f8fc", "#ff653b"],
  'custom-quantum':["Tecnología", "#1b2417", "#f2ffe6", "#b7ef4a"],
  'custom-terminal-green':["Tecnología", "#221c18", "#f8eee1", "#d99b5b"],
  'custom-synthwave':["Tecnología", "#e9eee8", "#33473c", "#91b59b"],
  'custom-pixel-art':["Tecnología", "#292b30", "#f1f1f1", "#b5bbc5"],
  'custom-circuit-board':["Tecnología", "#f0e8d6", "#2b2925", "#df5e3e"],
  'custom-space-station':["Tecnología", "#f7f0e2", "#30291d", "#ad8953"],
  'custom-satellite':["Tecnología", "#17130d", "#f8e8bd", "#d5ad52"],
  'custom-cyber-orange':["Tecnología", "#eef2f8", "#24324a", "#9db8df"],
  'custom-deep-ocean':["Tecnología", "#21131d", "#f8e7ef", "#b76b91"],
  'custom-neural-violet':["Tecnología", "#101d43", "#f2f5ff", "#6f8fe8"],
  'custom-data-studio':["Tecnología", "#2a1017", "#fff0f2", "#dc4665"],
  'custom-robotics':["Tecnología", "#f4e8df", "#201714", "#b75d45"],
  'custom-hologram-ice':["Tecnología", "#151218", "#f7eaf3", "#d8a2bc"],
  'custom-code-editor':["Tecnología", "#172b45", "#e8f0f7", "#69a9dc"],
  'custom-future-commerce':["Tecnología", "#191919", "#f4f4f4", "#d5ff00"],
  'custom-electric-mint':["Tecnología", "#f6f0eb", "#211b20", "#a42a50"],
  'custom-orbit':["Tecnología", "#e7dfd0", "#292821", "#88734f"],
  'custom-casa-nordica':["Hogar", "#1b2417", "#f2ffe6", "#b7ef4a"],
  'custom-decoracion':["Hogar", "#221c18", "#f8eee1", "#d99b5b"],
  'custom-madera-natural':["Hogar", "#e9eee8", "#33473c", "#91b59b"],
  'custom-ceramica':["Hogar", "#292b30", "#f1f1f1", "#b5bbc5"],
  'custom-jardin':["Hogar", "#f0e8d6", "#2b2925", "#df5e3e"],
  'custom-flores':["Hogar", "#f7f0e2", "#30291d", "#ad8953"],
  'custom-minimal-home':["Hogar", "#17130d", "#f8e8bd", "#d5ad52"],
  'custom-mediterraneo':["Hogar", "#eef2f8", "#24324a", "#9db8df"],
  'custom-japandi':["Hogar", "#21131d", "#f8e7ef", "#b76b91"],
  'custom-rustic-farm':["Hogar", "#101d43", "#f2f5ff", "#6f8fe8"],
  'custom-scandi-blue':["Hogar", "#2a1017", "#fff0f2", "#dc4665"],
  'custom-warm-sand':["Hogar", "#f4e8df", "#201714", "#b75d45"],
  'custom-olive-house':["Hogar", "#151218", "#f7eaf3", "#d8a2bc"],
  'custom-stone-slate':["Hogar", "#172b45", "#e8f0f7", "#69a9dc"],
  'custom-soft-clay':["Hogar", "#191919", "#f4f4f4", "#d5ff00"],
  'custom-natural-linen':["Hogar", "#f6f0eb", "#211b20", "#a42a50"],
  'custom-home-atelier':["Hogar", "#e7dfd0", "#292821", "#88734f"],
  'custom-coastal-living':["Hogar", "#f8edf0", "#46323b", "#d5a4b5"],
  'custom-country-cottage':["Hogar", "#eee5d5", "#3e4639", "#a3a77b"],
  'custom-interior-luxe':["Hogar", "#101b26", "#f5f8fc", "#ff653b"],
  'custom-spa-serenity':["Belleza", "#292b30", "#f1f1f1", "#b5bbc5"],
  'custom-skincare-lab':["Belleza", "#f0e8d6", "#2b2925", "#df5e3e"],
  'custom-beauty-blush':["Belleza", "#f7f0e2", "#30291d", "#ad8953"],
  'custom-cosmetics-noir':["Belleza", "#17130d", "#f8e8bd", "#d5ad52"],
  'custom-perfume-luxe':["Belleza", "#eef2f8", "#24324a", "#9db8df"],
  'custom-nail-studio':["Belleza", "#21131d", "#f8e7ef", "#b76b91"],
  'custom-hair-atelier':["Belleza", "#101d43", "#f2f5ff", "#6f8fe8"],
  'custom-clean-beauty':["Belleza", "#2a1017", "#fff0f2", "#dc4665"],
  'custom-pearl-clinic':["Belleza", "#f4e8df", "#201714", "#b75d45"],
  'custom-rose-quartz':["Belleza", "#151218", "#f7eaf3", "#d8a2bc"],
  'custom-herbal-ritual':["Belleza", "#172b45", "#e8f0f7", "#69a9dc"],
  'custom-glow-studio':["Belleza", "#191919", "#f4f4f4", "#d5ff00"],
  'custom-lavender-spa':["Belleza", "#f6f0eb", "#211b20", "#a42a50"],
  'custom-ocean-care':["Belleza", "#e7dfd0", "#292821", "#88734f"],
  'custom-gold-cosmetic':["Belleza", "#f8edf0", "#46323b", "#d5a4b5"],
  'custom-skin-clinic':["Belleza", "#eee5d5", "#3e4639", "#a3a77b"],
  'custom-natural-soap':["Belleza", "#101b26", "#f5f8fc", "#ff653b"],
  'custom-makeup-pop':["Belleza", "#1b2417", "#f2ffe6", "#b7ef4a"],
  'custom-beauty-editorial':["Belleza", "#221c18", "#f8eee1", "#d99b5b"],
  'custom-wellness-calm':["Belleza", "#e9eee8", "#33473c", "#91b59b"]
};

const fromLegacy=(id:string,p:string[]):ThemeTokens=>{const [bg,surface,surface2,line,muted,text,hero,accent]=p;const dark=luminance(bg)<0.35;const base=dark?hero:mix(text,accent,0.28);return {id,name:id,group:'Clásicos',desc:'',dark,bg,surface,surface2,line,muted,text,accent,accent2:mix(accent,dark?'#ffffff':'#000000',0.2),hero1:base,hero2:dark?bg:mix(text,'#000000',0.3)}};
const derive=(id:string,group:string,bg:string,text:string,accent:string):ThemeTokens=>{const dark=luminance(bg)<0.35;const ink=dark?bg:text;return {id,name:id,group,desc:'',dark,bg,surface:dark?mix(bg,'#ffffff',0.07):mix(bg,'#ffffff',0.62),surface2:dark?mix(bg,'#ffffff',0.12):mix(bg,text,0.07),line:dark?mix(bg,'#ffffff',0.2):mix(bg,text,0.16),muted:mix(text,bg,dark?0.32:0.38),text,accent,accent2:mix(accent,dark?'#ffffff':'#000000',0.18),hero1:mix(ink,accent,dark?0.3:0.26),hero2:mix(ink,'#000000',dark?0.42:0.34)}};
const fromNeon=(id:string,bg:string,accent:string):ThemeTokens=>derive(id,'Clásicos',bg,'#f4f7ff',accent);

const cache:Record<string,ThemeTokens>={};
export const themeById=(id:string):ThemeTokens=>{
 const key=String(id||'classic');
 if(cache[key])return cache[key];
 let t:ThemeTokens|undefined=CLAUDE_MAP[key];
 if(!t&&LEGACY[key])t=fromLegacy(key,LEGACY[key]);
 if(!t&&NEON[key])t=fromNeon(key,NEON[key][0],NEON[key][1]);
 if(!t&&CUSTOM[key]){const [g,bg,text,accent]=CUSTOM[key];t=derive(key,g,bg,text,accent)}
 if(!t)t=fromLegacy('classic',LEGACY.classic);
 cache[key]=t;return t;
};
export const themeGroupOf=(id:string)=>CLAUDE_MAP[id]?CLAUDE_MAP[id].group:CUSTOM[id]?CUSTOM[id][0]:'Clásicos';
export const isClaudeTheme=(id:string)=>!!CLAUDE_MAP[id];

// El acento propio del usuario solo manda si lo cambió a propósito; si queda el violeta
// de fábrica, se usa el acento del tema para que el tema realmente cambie el resultado.
export const accentIsCustom=(c:{accent?:string,accentCustom?:boolean})=>c.accentCustom===true||(!!c.accent&&c.accent.toLowerCase()!==DEFAULT_ACCENT&&c.accentCustom!==false);

export function themeVars(c:{theme:string,accent?:string,accentCustom?:boolean}):Record<string,string>{
 const t=themeById(c.theme);
 const custom=accentIsCustom(c);
 const accent=norm(custom?String(c.accent):t.accent);
 const accent2=custom?mix(accent,t.dark?'#ffffff':'#000000',0.18):t.accent2;
 const plate=(t.dark&&!t.glass)?t.surface2:t.hero2;
 const ink=t.dark?accent:mix(accent,'#000000',luminance(accent)>0.28?0.52:0.18);
 return {
  '--bg':t.bg,'--surface':t.surface,'--surface2':t.surface2,'--line':t.line,'--muted':t.muted,'--text':t.text,
  '--accent':accent,'--accent2':accent2,'--accent-ink':ink,'--on-accent':readableOn(accent),
  '--accent-soft':accent+'22','--accent-line':accent+'66',
  '--hero1':t.hero1,'--hero2':t.hero2,'--plate':plate,
  '--scheme':t.dark?'dark':'light',
  ...(t.display?{'--theme-display':t.display}:{})
 };
}
