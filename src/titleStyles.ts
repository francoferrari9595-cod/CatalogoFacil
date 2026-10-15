// Estilos de título y precio (V83.3). Cada estilo tiene su CSS en catalog.css con la clase .title-effect-<id>
export type TitleStyle={id:string,name:string,desc:string,group:string};
export const TITLE_GROUPS:string[]=['Clásicos', 'Metales', 'Neón', 'Degradados', 'Creativos'];
export const TITLE_STYLES:TitleStyle[]=[
 {id:'elegante',name:'Elegante',desc:'Blanco con sombra suave',group:'Clásicos'},
 {id:'limpio',name:'Limpio',desc:'Blanco liso, sin efectos',group:'Clásicos'},
 {id:'acento',name:'Color del tema',desc:'Usa el color de acento del tema',group:'Clásicos'},
 {id:'relieve',name:'Relieve grabado',desc:'Como letras estampadas',group:'Clásicos'},
 {id:'cristal',name:'Cristal',desc:'Transparente y luminoso',group:'Clásicos'},
 {id:'oro',name:'Oro premium',desc:'Degradado dorado',group:'Metales'},
 {id:'oro-rosa',name:'Oro rosa',desc:'Cobre rosado elegante',group:'Metales'},
 {id:'platino',name:'Platino',desc:'Plata brillante',group:'Metales'},
 {id:'bronce',name:'Bronce',desc:'Bronce antiguo',group:'Metales'},
 {id:'cromo',name:'Cromo',desc:'Reflejo de espejo',group:'Metales'},
 {id:'esmeralda',name:'Esmeralda joya',desc:'Verde joya con brillo',group:'Metales'},
 {id:'neon-cian',name:'Neón cian',desc:'Tubo cian brillante',group:'Neón'},
 {id:'neon-rosa',name:'Neón rosa',desc:'Fucsia intenso',group:'Neón'},
 {id:'neon-lima',name:'Neón lima',desc:'Verde lima eléctrico',group:'Neón'},
 {id:'neon-violeta',name:'Neón violeta',desc:'Violeta de discoteca',group:'Neón'},
 {id:'neon-naranja',name:'Neón naranja',desc:'Naranja de letrero',group:'Neón'},
 {id:'neon-rojo',name:'Neón rojo',desc:'Rojo de bar',group:'Neón'},
 {id:'resplandor-tema',name:'Resplandor del tema',desc:'Brillo con el color del tema',group:'Neón'},
 {id:'aurora',name:'Aurora',desc:'Verde, cian y violeta',group:'Degradados'},
 {id:'atardecer',name:'Atardecer',desc:'Rojo, naranja y dorado',group:'Degradados'},
 {id:'oceano',name:'Océano',desc:'Azul profundo a turquesa',group:'Degradados'},
 {id:'fuego',name:'Fuego',desc:'Llama amarilla a roja',group:'Degradados'},
 {id:'hielo',name:'Hielo',desc:'Azul glacial luminoso',group:'Degradados'},
 {id:'vapor',name:'Vaporwave',desc:'Pastel con sombras de color',group:'Creativos'},
 {id:'retro',name:'Retro 80s',desc:'Sombras escalonadas de colores',group:'Creativos'},
 {id:'3d',name:'Volumen 3D',desc:'Letras con profundidad',group:'Creativos'},
 {id:'contorno',name:'Contorno',desc:'Letras huecas con borde',group:'Creativos'},
 {id:'doble-contorno',name:'Contorno con sombra',desc:'Borde blanco y sombra de color',group:'Creativos'},
 {id:'comic',name:'Cómic',desc:'Amarillo con borde de historieta',group:'Creativos'},
 {id:'sombra-larga',name:'Sombra larga',desc:'Estilo flat design',group:'Creativos'}
];
const IDS=new Set(TITLE_STYLES.map(s=>s.id));
// Convierte cualquier valor guardado (incluidos los estilos de versiones anteriores) en un estilo válido.
export function normEffect(v:any,fallback:string):string{
 const id=String(v||'').trim();
 if(IDS.has(id))return id;
 if(IDS.has(id.replace(/^ts-/,'')))return id.replace(/^ts-/,'');
 if(id.startsWith('neon-'))return 'neon-cian';
 if(id.startsWith('metal-')||id==='gold'||id.startsWith('gold'))return 'oro';
 if(id.startsWith('gradient-'))return 'aurora';
 if(id.startsWith('3d-'))return '3d';
 if(id.startsWith('creative-'))return 'retro';
 if(id==='none')return 'limpio';
 return IDS.has(fallback)?fallback:'elegante';
}
