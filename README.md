# Amaim File Server

Servidor de archivos estáticos con interfaz web. Permite subir archivos y servirlos via `https://www.amaim.lat/scripts/`.

## Características
- 🖥️ Interfaz web drag & drop
- 📋 Copia la URL con un click
- 🗑️ Elimina archivos desde la UI
- 🔍 Busca archivos
- 📦 Soporta cualquier tipo de archivo (txt, js, json, css, etc.)
- 🔐 API Key opcional para proteger la UI

## Despliegue en Coolify

### Opción A: Desde Git (recomendado)
1. Sube este código a un repositorio Git (GitHub, GitLab, etc.)
2. En Coolify → New Resource → Application → Git Repository
3. Configura el dominio: `https://www.amaim.lat`
4. Variables de entorno:
   ```
   BASE_URL=https://www.amaim.lat
   PORT=3000
   ```
5. Deploy ✅

### Opción B: Subir archivos al VPS manualmente (via SCP)
```bash
scp "archivo.txt" root@109.123.243.128:/var/lib/docker/volumes/amaim_files/_data/
```

## SSL / Cloudflare
Configurar Cloudflare en modo **Flexible** (la app sirve en HTTP, Cloudflare maneja HTTPS).

## URLs
- Interfaz web: `https://www.amaim.lat`
- Archivos servidos: `https://www.amaim.lat/scripts/nombre-archivo.txt`
- Health check: `https://www.amaim.lat/health`

## API Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/files` | Lista todos los archivos |
| POST | `/api/upload` | Sube uno o más archivos |
| DELETE | `/api/files/:name` | Elimina un archivo |