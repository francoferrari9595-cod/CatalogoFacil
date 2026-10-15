## Catálogo Fácil V73 — recuperación crítica del editor

Ver `CAMBIOS-V73-RECUPERACION-CRITICA.txt` para detalles. Esta versión parte de V72 y no modifica ni borra los datos remotos.

# Catálogo Fácil V52

Basado en V51, conserva sus funciones y agrega tarjetas de producto más compactas, precios centrados y visor de fotos ampliable con controles de zoom.

V26 - Publicacion GitHub corregida: el encabezado Basic se envia como un argumento unico para evitar Git Credential Manager/device login.

# Catálogo Fácil V21

Esta versión continúa directamente desde V20 y corrige el publicador para Windows.

## Subir el proyecto completo a GitHub

Ejecutá `SUBIR_A_GITHUB.bat` y escribí solamente la URL del repositorio, por ejemplo:

`https://github.com/USUARIO/CatalogoFacil`

El BAT:

- detecta Git aunque no esté agregado al PATH;
- reemplaza el remoto anterior por el repositorio indicado;
- usa la rama `main`;
- agrega todos los archivos del proyecto;
- crea el commit;
- hace push a GitHub;
- reemplaza el contenido anterior de `main` cuando sea necesario.

Después GitHub Actions se encarga del despliegue de GitHub Pages.


## Publicación del proyecto en GitHub

Ejecutá `SUBIR_A_GITHUB.bat`. El archivo pide únicamente la URL del repositorio, comprueba el acceso antes de modificar Git local, elimina barras finales de la URL y configura `origin` correctamente. Luego sube la rama `main`.


PUBLICACION V23: SUBIR_A_GITHUB.bat pide la URL del repositorio y usa la autorizacion incluida en el BAT; no pide el token en cada ejecucion.


## Publicación sin tokens para los usuarios

La publicación de catálogos ya no usa PAT dentro del código. El proyecto incluye `publisher/` y `CONFIGURAR_PUBLICADOR.bat`. El propietario configura el publicador una sola vez en Cloudflare; después los usuarios finales solo pulsan **Publicar catálogo**. Los catálogos se guardan en Cloudflare KV y el enlace público de GitHub Pages permanece igual.

## Publicador V34
Esta versión elimina la instalación local de Wrangler/workerd. La configuración del publicador se realiza una sola vez en Cloudflare Dashboard y luego se guarda únicamente la URL pública del Worker en `public/api-config.js`. Los usuarios finales no introducen tokens.


## V37 - Publicador preconfigurado

La aplicación incluye como respaldo la URL pública del Worker configurado: `https://catalogo-facil-publisher.francoferrari9595.workers.dev`. Esto evita que el editor quede en estado 'publicador no configurado' si `api-config.js` no llegó a publicarse en GitHub Pages. `CONFIGURAR_PUBLICADOR.bat` permite reemplazarla si el propietario cambia el Worker.


## V38
Esta versión corrige el problema detectado: GitHub Pages estaba mostrando V36, cuyo `API_BASE` no tenía respaldo. V38 mantiene el respaldo del Worker y el BAT de subida verifica el contenido real de `origin/main` después del push.

## V42 — Categorías, búsqueda, redes y administración
V42 continúa desde V41. Incluye categorías editables/eliminables, búsqueda en el catálogo público, enlaces de redes sociales, grilla responsive de productos y contraseña por catálogo para publicar/actualizar. Añade panel administrativo accesible mediante `?admin=1`; requiere desplegar `publisher/worker.js` y configurar el secreto `ADMIN_KEY` en Cloudflare. Ver `LEEME-PRIMERO.txt` antes de desplegar el Worker.


## V48 — Variantes, aprobación de catálogos, alertas y diseños

Esta entrega parte de V47 y mantiene el formato de catálogo y los campos anteriores.

- Productos: opción desactivada por defecto para usar talles y colores; permite seleccionar varios talles (XS, S, M, L, XL, XXL, XXXL, Unitalla) y colores de una paleta. El cliente elige sus variantes y se incluyen en el pedido de WhatsApp.
- Altas: los catálogos nuevos quedan pendientes de aprobación y no se muestran públicamente hasta que el administrador los aprueba. Los catálogos que ya existían conservan su estado.
- Administración: enviar o quitar una alerta visible arriba del catálogo; texto sugerido: “Por favor efectuar pago WhatsApp 2615407856”.
- Diseño: 10 estilos nuevos neón/glass y cuatro fuentes adicionales.
- Se conservan las fechas de vencimiento, exportación JSON, contraseña por catálogo y publicador Cloudflare.

**Importante:** para que funcionen las aprobaciones y alertas, hay que desplegar el archivo actualizado `publisher/worker.js` en el Worker de Cloudflare. Conservá el binding KV `CATALOGS` y el secreto `ADMIN_KEY`; no los borres ni los cambies. No se modifica el contenido almacenado de los catálogos existentes.

VERSIÓN V55 — Ajustes de catálogo público: descripciones completas sin recorte, espacios entre descripción/precio/botón más compactos, precio centrado, eliminación de la etiqueta visible “Ver foto” manteniendo la ampliación al tocar la imagen y ocho tipografías nuevas para elegir. Se conserva el resto del proyecto y la configuración del publicador.


## V55 — Ajuste compacto de tarjetas
- Descripción de producto completa hasta 50 caracteres, sin recorte por CSS.
- Precio centrado justo debajo de la descripción.
- Botón a ancho completo justo debajo del precio.
- Tarjetas públicas apiladas verticalmente para eliminar espacios artificiales entre imagen, texto, precio y acción.

## V75 — Descripciones de productos de hasta 200 caracteres

La descripción de cada producto ahora permite hasta 200 caracteres en el editor y se muestra con ese límite en el catálogo público. La descripción general del negocio conserva el límite de 100 caracteres. Las respuestas generales de la IA no se limitan por este cambio.

## V76 — IA contextual por producto
- El acceso permanente a Estudio IA se reemplaza por un botón con el icono ✨ IA dentro de cada producto.
- Al tocarlo, se abre el asistente con ese producto seleccionado.
- Se quitó el botón Guardar catálogo de la fila de acciones de carga; las opciones de respaldo que forman parte de Publicar se conservan.


## V79 - Corrección de publicación en Windows
El BAT ahora configura Git para rutas largas y detecta proyectos extraídos dentro de múltiples carpetas anidadas. Para evitar el error `Filename too long`, extraé el ZIP directamente en `C:\CatalogoFacilV79`.


## V82 — Proveedor de IA GroqCloud

La integración activa de IA ahora utiliza GroqCloud a través del Worker de Cloudflare. No se incluye ninguna clave en el frontend ni en el repositorio. En Cloudflare, abrí Workers & Pages → tu Worker → Settings → Variables and Secrets, agregá `GROQ_API_KEY` como **Secret**, guardá y hacé **Deploy**. Conservá `CATALOGS`, `ADMIN_KEY` y cualquier otro binding existente. El modelo configurado por defecto es `llama-3.3-70b-versatile`; los límites, disponibilidad y posibles cargos dependen de tu cuenta GroqCloud.
