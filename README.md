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
