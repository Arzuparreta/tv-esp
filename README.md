<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="TV España icon">
</p>

<h1 align="center">TV España</h1>

<p align="center">
  <strong>Toda la televisión pública española en una sola webapp.</strong><br>
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

Una webapp para ver **todos los canales gratuitos de la TDT española** desde cualquier dispositivo en tu red local. Canales públicos pagados con los impuestos de todos los españoles, accesibles desde una interfaz bonita en vez de 15 webs distintas.

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
- **Proxy backend** que resuelve CORS y obtiene tokens dinámicos de la API de Atresplayer
- **Multi-fuente con fallback** — si un stream falla, salta automáticamente al siguiente
- **Navegación adaptativa** — barra inferior en móvil y barra lateral plegable en iPad y escritorio
- **Claro y oscuro** — sigue la apariencia del sistema, con tipografía nativa y controles táctiles de al menos 44 px
- **Reproducción accesible** — controles de vídeo nativos, selector de canales, foco contenido y retorno al canal al cerrar
- **Logotipos locales** — la cuadrícula no depende de peticiones a redes sociales
- **Favoritos** guardados en localStorage
- **Búsqueda y filtro** por categoría
- **Atajos de teclado** — `Escape` para cerrar, `F` para fullscreen, `M` para sidebar
- **Responsiva** — funciona en móvil, tablet y escritorio
- **Sin anuncios, sin tracking, sin login**

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
│  ├── GET /atresplayer?ch= → API token + redirect│
│  └── GET /health                                │
└─────────────────────────────────────────────────┘
```

## Requisitos

- **Node.js** >= 18
- **npm** >= 9

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

# Incluye las integraciones en vivo con el proxy local
npm test

# Watch mode durante desarrollo
npm run test:watch
```

Los tests cubren:
- **Integridad de canales** — IDs únicos, categorías válidas, URLs de fuentes correctas
- **Lógica de fallback** — orden de prioridad de fuentes, cadena de fallback completa
- **Proxy integration** — health check, proxy de m3u8, API Atresplayer para los 6 canales

> Los tests de integración requieren el proxy corriendo en `:3555`. Si no está arrancado, se saltan automáticamente.

## Estructura del proyecto

```
tv-esp/
├── deploy/
│   ├── tv-esp-proxy.service   # plantilla systemd (proxy)
│   ├── tv-esp-web.service     # plantilla systemd (Vite)
│   └── install-systemd.sh     # instala y habilita ambas unidades
├── server/
│   └── proxy.mjs          # Express proxy (CORS + Atresplayer API)
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

Las pruebas de Playwright cubren favoritos persistentes, búsqueda, categorías, foco del reproductor, tamaños de 320 a 1440 px, orientación de iPad, logotipos y apariencia clara/oscura. En Linux con Chromium del sistema se puede usar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ui -- --project=desktop --project=mobile`.

Los logotipos de `public/logos/` proceden de [tv-logo/tv-logos](https://github.com/tv-logo/tv-logos), de las fuentes originales del registro de canales y de RTVE (La 1 y La 2, variantes coloreadas para fondos claros). Las marcas pertenecen a sus respectivos canales.

## Notas

- **Cuatro y Telecinco** usan DRM dinámico de Mediaset; abren en pestaña externa vía mitele.es como fallback.
- **Atresmedia** (Antena 3, La Sexta, Neox, Nova, Mega, Atreseries) funcionan in-app gracias a la integración con la API de Atresplayer.
- Todos los canales son **públicos y gratuitos**. No se bypasea ningún DRM ni contenido de pago.

---

<p align="center">
  Hecho con cariño para papá.
</p>
