<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="TV España icon">
</p>

<h1 align="center">TV España</h1>

<p align="center">
  <strong>Toda la televisión pública española en una sola webapp.</strong><br>
  Interfaz premium con glassmorphism, reproductor HLS de alto rendimiento y cero anuncios.
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
- **Glassmorphism UI** — diseño dark-first inspirado en Apple, animaciones suaves
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
# Unit tests (channels, player logic)
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
│   ├── index.css           # Glassmorphism styles + Tailwind
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

## Notas

- **Cuatro y Telecinco** usan DRM dinámico de Mediaset; abren en pestaña externa vía mitele.es como fallback.
- **Atresmedia** (Antena 3, La Sexta, Neox, Nova, Mega, Atreseries) funcionan in-app gracias a la integración con la API de Atresplayer.
- Todos los canales son **públicos y gratuitos**. No se bypasea ningún DRM ni contenido de pago.

---

<p align="center">
  Hecho con cariño para papá.
</p>
