# Investigación de fuentes de televisión

Verificado el 4 de noviembre de 2026. La prueba se realizó en la instancia local; el estado de un emisor puede cambiar sin cambios en este repositorio.

## Qué significa una lista M3U

M3U es un índice de URLs. No es un proveedor, no aporta licencias y no convierte por sí sola un canal protegido en una señal reproducible en HTML. HLS usa playlists M3U8 y puede reproducirse con hls.js o el soporte nativo del navegador. DASH usa MPD y necesita otro reproductor; además, DRM requiere la autorización del proveedor.

La presencia de una aplicación en App Store no demuestra que tv-esp pueda reutilizar sus fuentes. Un operador puede tener un acuerdo de distribución. [Tivify explica que tiene un acuerdo con los editores de Atresmedia y Mediaset y ofrece esos canales en Plus/Premium](https://tivify.freshdesk.com/es/support/solutions/articles/80001027706--c%C3%B3mo-puedo-ver-los-canales-de-mediaset-y-atresmedia-). [TDTChannels retiró Atresmedia por una solicitud externa en julio de 2025](https://www.tdtchannels.com/noticias/2025/07/27/atresmedia-deja-de-estar-en-tdtchannels/).

## Atresmedia: el manifiesto no basta

La integración anterior pedía `NODRM=true` y seleccionaba únicamente la primera fuente `application/vnd.apple.mpegurl`. Durante la investigación, el CDN de esa fuente respondió HTTP 492. La API también publica HLS legacy, HLS SSAI y, para Antena 3 y La Sexta, HLS HEVC. La señal SSAI respondió 200 en los manifiestos de las seis cadenas, pero algunos fragmentos devolvieron 492. Por tanto, responder `#EXTM3U` no acredita reproducción. No se ha atribuido el motivo interno del 492 a partir de ese código.

La fuente HEVC oficial de La Sexta sí permitió descargar y decodificar vídeo. Chromium de esta máquina no admite HEVC mediante MediaSource, por lo que se incorporó conversión local a H.264/AAC con FFmpeg. Se comprobó vídeo dentro de tv-esp a 1280×720, con más de dos segundos de avance y 103 fotogramas decodificados. Se seleccionan por separado la variante de vídeo de 720p y la pista de audio española publicada en el master, conservando ambas. La conversión usa una fuente publicada por la API, no obtiene claves DRM ni transforma una respuesta de acceso denegado en contenido. No guarda emisiones en disco.

También existe un reproductor incrustable oficial: `https://www.atresplayer.com/embed/live/<canal>/`. [Antena 3 lo utiliza en su propia página de directo](https://www.antena3.com/programas/antena3-directo_202610266adf1c57c04834534809aabc.html). Se incorpora como alternativa dentro de tv-esp, conservando el reproductor, anuncios, controles y posibles pasos de consentimiento/registro del emisor. Puede ser necesario pulsar «Directo». No se presenta la carga del iframe como confirmación de vídeo: los errores internos de un iframe externo no son observables de forma fiable; «Probar otra fuente» y «Web oficial» permanecen accesibles.

[Las condiciones de Atresplayer](https://statics.atresmedia.com/atresplayer/assets/legal/condiciones-de-participacion.html) describen el registro gratuito, las modalidades de pago y las restricciones territoriales. Usar una fuente oficial no equivale a acreditar un permiso general de retransmisión. Esta implementación no concede derechos de distribución ni elimina esas condiciones.

## Mediaset y otros canales

Los directos actuales de Mediaset son [Mediaset Infinity — Cuatro](https://www.mediasetinfinity.es/directo/cuatro/) y [Telecinco](https://www.mediasetinfinity.es/directo/telecinco/). Se actualizaron los enlaces antiguos de Mitele para las siete cadenas incluidas. No se encontró una fuente HLS sin DRM y con condiciones de uso verificables para incorporarla al catálogo. Se mantiene el reproductor oficial externo como salida y se permite añadir una fuente compatible del proveedor o sintonizador del usuario.

El [registro de TDTChannels](https://github.com/LaQuay/TDTChannels/blob/master/TELEVISION.md) permitió localizar URLs actuales de TV3, El Confidencial, À Punt y Canal Extremadura, que se comprobaron mediante HTTP antes de incorporarlas. TV3 conserva la identificación de sus ediciones internacional/España. Se añadió la emisión oficial de IB3 Global en YouTube como alternativa. Algunos directos deportivos solo emiten durante eventos; no se puede garantizar disponibilidad continua.

## Cadena implementada

1. Fuentes HLS de las listas configuradas por el propietario de la instancia, en orden de configuración.
2. Conversión local de la fuente oficial HEVC cuando exista y FFmpeg esté disponible, con máximo de dos espectadores simultáneos en esta modalidad.
3. Fuentes HLS oficiales resueltas de nuevo al abrir/reintentar, con SSAI antes de las variantes antiguas, y fuentes estáticas del catálogo.
4. Reproductor oficial incrustado o YouTube, cuando existe una alternativa identificada.
5. Enlace al directo oficial. Si una fuente falla o no arranca en 15 segundos, el reproductor prueba la siguiente; si el vídeo deja de avanzar, espera hasta 12 segundos. Las pausas y el bloqueo de autoplay no disparan el salto.

La conversión no se inicia con cada consulta de fuentes: solo al reproducir esa alternativa. Al cerrar el reproductor, el servidor termina FFmpeg. No hay grabaciones temporales. Las listas se leen en paralelo con límite de tamaño y caché de un minuto; una lista inaccesible no bloquea las demás. Su configuración no se incluye en el repositorio.

## Qué queda fuera de la garantía

No se ha demostrado que todos los canales puedan verse dentro de tv-esp en cualquier región, programa o navegador. Mediaset requiere su plataforma oficial o una fuente autorizada configurada; no se importan listas anónimas de retransmisión. El resto de fuentes depende del emisor. Los resultados HTTP y la decodificación real se distinguen expresamente en las verificaciones.

Las pruebas deterministas cubren selección y agotamiento de fuentes, fallos parciales de listas, rutas y redirecciones HLS, rangos de bytes, arranque/estancamiento, autoplay/pausa, límites y cierre de procesos de conversión. Las pruebas de interfaz cubren Chromium de escritorio y móvil. WebKit no pudo arrancar en esta máquina por dependencias del sistema ausentes; no se afirma validación de reproducción en un iPad físico.

Resultado de cierre: 37 pruebas unitarias, 20 pruebas de interfaz Chromium y 10 comprobaciones HTTP de integración en vivo correctas; cuatro pruebas de decodificación real (Antena 3/La Sexta en escritorio y móvil) correctas. Se selecciona expresamente la variante española de 720p para evitar abrir todas las calidades o reescalar la variante de 360p. Las pruebas de emisiones externas se ejecutan separadas de CI.

En las comprobaciones simultáneas de emisiones externas se observaron fallos intermitentes de arranque, sin causa atribuida de forma concluyente. Los cuatro casos de aceptación se ejecutan en serie para aislar el estado del emisor; eso no acredita haber resuelto la intermitencia en varias sesiones. El servidor limita la conversión a dos procesos y recoge diagnóstico de fallos de arranque/salida sin registrar URLs, tokens ni IPs.
