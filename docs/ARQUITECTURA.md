# Arquitectura de Catálogo Fácil

## Objetivo
Aplicación web estática, mobile-first y sin servidor propio.

## Capas
- `src/main.tsx`: aplicación React y lógica del catálogo.
- `src/styles.css`: sistema visual responsive.
- `public/`: archivos públicos, manifest y robots.
- `.github/workflows/deploy.yml`: compilación y publicación automática en GitHub Pages.
- `docs/`: documentación del proyecto.

## Persistencia
La edición se guarda localmente en el navegador. El proyecto también permite exportar/importar el catálogo como JSON.

## Publicación
GitHub Actions ejecuta `npm install` y `npm run build`, publica `dist` en GitHub Pages y no requiere Render, Cloudflare, PostgreSQL ni servidor propio.

## Seguridad
No se almacenan tokens de GitHub dentro de la aplicación pública. Las credenciales de Git deben gestionarse mediante Git/Windows Credential Manager o GitHub CLI.
