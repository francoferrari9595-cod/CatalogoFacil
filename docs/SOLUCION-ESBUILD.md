# Solución del error esbuild / npm install

Si aparece `npm ERR! code ELIFECYCLE` y `esbuild ... postinstall: node install.js`, normalmente el problema está en el runtime Node/npm o en una instalación parcial de `node_modules`.

El BAT de este proyecto evita depender del Node instalado en Windows: descarga un runtime Node 24.21.0 y usa su npm para instalar las dependencias. Además elimina `node_modules` anterior antes de instalar.

Los avisos `npm WARN` sobre dependencias opcionales no son por sí solos un fallo; el BAT solo detiene el proceso cuando npm devuelve un código de error o cuando Vite no genera `dist/index.html`.
