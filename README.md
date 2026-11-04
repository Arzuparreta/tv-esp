<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="TV España icon">
</p>

<h1 align="center">TV España</h1>

<p align="center">
  <strong>La televisión española en abierto, en una sola webapp.</strong><br>
  Televisión en directo con una interfaz adaptada a móvil, iPad y escritorio.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-blue?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/vite-8-purple?logo=vite" alt="Vite 8">
  <img src="https://img.shields.io/badge/tailwindcss-4-06B6D4?logo=tailwindcss" alt="TailwindCSS 4">
  <img src="https://img.shields.io/badge/typescript-6-3178C6?logo=typescript" alt="TypeScript 6">
  <img src="https://img.shields.io/badge/license-private-red" alt="Private">
</p>

---

## Qué es esto

Una webapp para acceder a **canales de la TDT española y emisiones gratuitas** desde cualquier dispositivo en tu red local. Reproduce las fuentes HLS compatibles dentro de la app y ofrece el directo oficial cuando el canal requiere su propio reproductor. La disponibilidad depende del emisor, la región y los derechos de cada programa.

### Canales incluidos (46+)

| Categoría | Canales |
|-----------|---------|
| **Principales** | La 1, La 2, Antena 3, La Sexta, Cuatro, Telecinco |
| **Informativos** | 24 Horas, Euronews, 3Cat Info, El País, El Confidencial, Negocios TV |
| **Deportes** | Teledeporte, Real Madrid TV, Top Barça, GOL, ETB Deportes |
| **Temáticos** | Neox, Nova, Mega, Atreseries, FDF, Energy, Divinity, TRECE, DMAX, and more |
| **Infantiles** | Clan TVE, Boing, Disney Channel, Pocoyó |
| **Autonómicos** | TV3, ETB 1/2, Canal Sur, Telemadrid, À Punt, TVG, Aragón TV, and more |

## Características

- **Reproductor HLS** de alto rendimiento con [hls.js](https://github.com/video-dev/hls.js) — bitrate adaptativo, hasta 1080p
- **Proxy backend** que resuelve CORS y obtiene fuentes con tokens dinámicos de la API de Atresplayer, priorizando su señal con publicidad integrada (SSAI)
- **Multi-fuente con fallback** — prueba todas las fuentes; si el vídeo no comienza en 15 s o deja de avanzar durante 12 s, pasa a la siguiente. Pausar o bloquear el autoplay no descarta el canal
- **Compatibilidad de vídeo** — si está instalado FFmpeg, adapta la fuente oficial HEVC de Antena 3/La Sexta a H.264 para navegadores que no pueden reproducirla
- **Fuentes alternativas M3U** — admite varias listas de tu proveedor autorizado o sintonizador, con correspondencia por ID o nombre
- **Cambio manual de fuente** y enlace a la web oficial, también para embeds que no comunican sus errores
- **Navegación adaptativa** — barra inferior en móvil y barra lateral plegable en iPad y escritorio
- **Claro y oscuro** — sigue la apariencia del sistema, con tipografía nativa y controles táctiles de al menos 44 px
- **Reproducción accesible** — controles de vídeo nativos, selector de canales, foco contenido y retorno al canal al cerrar
- **Logotipos locales** — la cuadrícula no depende de peticiones a redes sociales
- **Favoritos** guardados en localStorage
- **Búsqueda y filtro** por categoría
- **Atajos de teclado** — `Escape` para cerrar, `F` para fullscreen, `M` para sidebar
- **Responsiva** — funciona en móvil, tablet y escritorio
- **Sin anuncios ni seguimiento añadidos por tv-esp** — conserva los anuncios del emisor; los reproductores externos pueden requerir registro e incluir seguimiento propio

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│  Browser (React + hls.js)        :5173          │
│  ├── HlsPlayer ← streams via proxy             │
│  ├── IframePlayer / YouTubePlayer               │
│  └── WebPlayer (abre pestaña externa)           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Express Proxy Server            :3555          │
│  ├── GET /proxy?url=  → CORS bypass + rewrite   │
│  ├── GET /sources?ch= → API + listas M3U       │
│  ├── GET /compatible?ch= → HEVC → H.264       │
│  ├── GET /atresplayer?ch= → compatibilidad      │
│  └── GET /health                                │
└─────────────────────────────────────────────────┘
```

## Requisitos

- **Node.js** >= 22.12
- **npm** >= 9
- **FFmpeg** con decodificador HEVC y codificador `libx264` para la reproducción compatible de Atresmedia. Si no está instalado, se mantienen las fuentes HLS y el reproductor oficial incrustado

## Instalación

```bash
git clone git@github.com:Arzuparreta/tv-esp.git
cd tv-esp
npm install
```

## Uso

### Arrancar todo (frontend + proxy)

```bash
npm start
```

Esto levanta:
- **Vite dev server** en `http://<tu-ip>:5173`
- **Proxy HLS** en `http://<tu-ip>:3555`

Abre `http://<ip-del-servidor>:5173` desde cualquier dispositivo en tu red.

### Servicio systemd (recomendado en el servidor)

Para que **proxy y frontend arranquen al boot** y se **reinicien solos** si fallan (sin `npm start` a mano):

```bash
cd /ruta/al/repo/tv-esp
npm install
sudo ./deploy/install-systemd.sh
```

El script instala dos unidades en `/etc/systemd/system/`:

| Unidad | Puerto | Rol |
|--------|--------|-----|
| `tv-esp-proxy.service` | **3555** | Proxy HLS / Atresplayer |
| `tv-esp-web.service` | **5173** | Vite (interfaz) |

Ambas usan `Restart=always` y `RestartSec=5`. El frontend **depende** del proxy (`Requires=`).

**Comandos útiles:**

```bash
sudo systemctl status tv-esp-proxy tv-esp-web
sudo systemctl restart tv-esp-proxy tv-esp-web
journalctl -u tv-esp-proxy -u tv-esp-web -f
```

Si el código vive bajo otro usuario, antes de instalar:

```bash
sudo TV_ESP_USER=tu_usuario ./deploy/install-systemd.sh
```

Tras mover el repo o cambiar de máquina, vuelve a ejecutar `install-systemd.sh` para regenerar las rutas en los `.service`.

### Arrancar por separado

```bash
# Terminal 1 — proxy
npm run proxy

# Terminal 2 — frontend
npm run dev
```

### Build de producción

```bash
npm run build
npm run preview
```

El build se genera en `dist/`. Sirve los estáticos con cualquier servidor web y mantén el proxy corriendo aparte.

## Tests

```bash
# Pruebas de canales y lógica de reproducción
npm run test:unit

# Pruebas de interfaz en Chromium (desktop y móvil) y WebKit (iPad)
npx playwright install --with-deps chromium webkit
npm run test:ui

# Todas las pruebas deterministas (sin emisiones externas)
npm test

# Integraciones reales: requiere el proxy local en :3555
npm run test:live

# Watch mode durante desarrollo
npm run test:watch
```

Los tests cubren:
- **Integridad de canales** — IDs únicos, categorías válidas, URLs de fuentes correctas
- **Lógica de fallback** — orden de prioridad de fuentes, cadena de fallback completa
- **Proxy y fuentes** — variantes de Atresplayer, listas M3U, redirecciones, rutas relativas, byte ranges y degradación parcial
- **Disponibilidad** — arranque, vídeo estancado, pausa, autoplay bloqueado, reintento y liberación de recursos
- **Integración en vivo** — resolución y master SSAI de las 6 cadenas de Atresmedia; salida MP4 compatible real de Antena 3/La Sexta. Un manifiesto correcto no prueba por sí solo la reproducción

> Las integraciones externas solo se ejecutan con `npm run test:live`. Si se solicitan y el proxy no está disponible, fallan. Puedes indicar otra dirección con `TV_ESP_PROXY=http://servidor:3555`. CI ejecuta las pruebas deterministas.

## Estructura del proyecto

```
tv-esp/
├── deploy/
│   ├── tv-esp-proxy.service   # plantilla systemd (proxy)
│   ├── tv-esp-web.service     # plantilla systemd (Vite)
│   └── install-systemd.sh     # instala y habilita ambas unidades
├── server/
│   ├── proxy.mjs          # Arranque y configuración
│   ├── app.mjs            # Express, resolución de fuentes y proxy HLS
│   ├── sources.mjs        # Fuentes oficiales y listas M3U configuradas
│   └── compatible.mjs     # Conversión local HEVC → H.264, sin archivos
├── src/
│   ├── components/         # React components (players, grid, sidebar...)
│   ├── data/
│   │   ├── channels.ts     # Registro de canales con fuentes
│   │   └── types.ts        # TypeScript types
│   ├── hooks/              # useHls, useFavorites, useKeyboard
│   ├── lib/
│   │   ├── player.ts       # Source resolution & fallback logic
│   │   └── proxy.ts        # Proxy URL helpers
│   ├── App.tsx
│   ├── index.css           # Adaptive layout, themes and accessibility
│   └── main.tsx
├── tests/                  # Vitest test suites
├── public/                 # favicon, icons
└── package.json
```

## Añadir un canal nuevo

Edita `src/data/channels.ts` y añade una entrada:

```typescript
{
  id: 'mi-canal',
  name: 'Mi Canal',
  logo: 'https://example.com/logo.png',
  category: 'tematicos',     // principales | informativos | deportes | tematicos | infantiles | autonomicos
  web: 'https://example.com',
  sources: [
    { type: 'hls', url: 'https://stream.example.com/live.m3u8' },
    { type: 'web', url: 'https://example.com/directo' },   // fallback
  ],
}
```

Ejecuta `npm test` para verificar que no has roto nada.

## Diseño y validación de interfaz

La navegación sigue las guías actuales de Apple para [iPadOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados) y [materiales](https://developer.apple.com/design/human-interface-guidelines/materials): superficies simples para el contenido y translucidez limitada a navegación y barras. En móvil, En directo, Favoritos y Buscar quedan al alcance del pulgar. A partir de 760 px aparece la navegación lateral; la cuadrícula adapta su densidad al espacio disponible, también en Split View.

Las pruebas de navegador se ejecutan en local; CI solo ejecuta lint, build y tests unitarios. Las pruebas de Playwright cubren favoritos persistentes, búsqueda, categorías, foco del reproductor, tamaños de 320 a 1440 px, orientación de iPad, logotipos y apariencia clara/oscura. En Linux con Chromium del sistema se puede usar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ui -- --project=desktop --project=mobile`.

Los logotipos de `public/logos/` proceden de [tv-logo/tv-logos](https://github.com/tv-logo/tv-logos), de las fuentes originales del registro de canales y de RTVE (La 1 y La 2, variantes coloreadas para fondos claros). Las marcas pertenecen a sus respectivos canales.

## Listas M3U como fuentes adicionales

M3U/M3U8 es un formato de lista: no concede derechos de emisión ni elimina DRM o restricciones geográficas. Solo configura fuentes que tengas derecho a utilizar, por ejemplo las de tu proveedor o tu sintonizador local. tv-esp no instala listas de terceros ni extrae claves DRM.

Puedes añadir varias listas locales o remotas mediante un array JSON. Se consultan en paralelo, se actualizan cada minuto y una lista caída no anula las demás:

```bash
TV_ESP_PLAYLISTS='["/ruta/canales.m3u","https://mi-proveedor.example/canales.m3u"]' npm run proxy
```

Para systemd, añade un override con `sudo systemctl edit tv-esp-proxy`:

```ini
[Service]
Environment='TV_ESP_PLAYLISTS=["/ruta/canales.m3u","https://mi-proveedor.example/canales.m3u"]'
```

Después ejecuta `sudo systemctl daemon-reload` y `sudo systemctl restart tv-esp-proxy tv-esp-web`. El usuario del servicio necesita permiso de lectura sobre los archivos. Evita publicar listas con credenciales: los usuarios que acceden a tu instancia local pueden inspeccionar las URLs de reproducción.

Ejemplo de una entrada (repite el mismo ID con otra URL para añadir fallbacks):

```m3u
#EXTM3U
#EXTINF:-1 tvg-id="LaSexta.TV" tvg-name="La Sexta",La Sexta
https://mi-sintonizador.example/lasexta/index.m3u8
```

La coincidencia usa el `id`, el `epgId` o el nombre exacto del canal, normalizando mayúsculas, acentos y sufijos HD/FHD/UHD. Solo se admiten entradas HTTP(S) HLS (`.m3u8`, con o sin query); no se ejecutan opciones VLC/Kodi, cabeceras personalizadas ni claves incluidas en listas. Los streams TS/UDP/RTSP o DASH necesitan una salida HLS de tu proveedor o sintonizador. Las listas no se guardan en el navegador.

## Disponibilidad y límites

- **Atresmedia**: obtiene las variantes HLS actuales de su API oficial. Orden: listas configuradas, vídeo compatible mediante FFmpeg si hay una fuente HEVC oficial, HLS nativo (SSAI primero), reproductor oficial incrustado y web oficial. Los tokens se renuevan al abrir el canal o pulsar «Reintentar fuentes». No se solicita `NODRM=true` ni se altera el contenido del emisor.
- **Conversión compatible**: adapta únicamente el códec de la fuente oficial, hasta 720p, conservando la pista de audio española que el emisor publica por separado, sin descifrar contenido, alterar anuncios de la señal ni guardar vídeo. Usa hasta dos conversiones simultáneas, limita los hilos de FFmpeg y detiene el proceso al cerrar o cambiar de canal. Configura `TV_ESP_FFMPEG=/ruta/ffmpeg` para otra instalación, o `TV_ESP_FFMPEG=0` para desactivarla. Si falla o está ocupada, siguen disponibles las otras fuentes.
- **Cuatro, Telecinco, FDF, Energy, Divinity, Be Mad y Boing**: se reproducen dentro de tv-esp si has configurado una fuente HLS compatible. En otro caso, se abre su directo oficial en Mediaset Infinity; puede exigir registro, DRM y estar limitado a España.
- **Todos los canales** conservan una salida a su web oficial si las fuentes incluidas o configuradas fallan. «Probar otra fuente» permite salir de un embed que carga una página pero no reproduce vídeo.
- No se puede garantizar que todas las emisiones estén disponibles dentro de tv-esp en todo momento. Una app en App Store o una URL pública no acredita por sí sola los permisos de retransmisión.

Consulta la [investigación y evidencia de las fuentes](docs/streaming-sources.md).

---

<p align="center">
  Hecho con cariño para papá.
</p>
