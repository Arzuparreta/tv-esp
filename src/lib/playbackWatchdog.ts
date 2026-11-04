export const STARTUP_TIMEOUT_MS = 15000
export const STALL_TIMEOUT_MS = 12000

/** Downloaded fragments alone do not prove that a browser can decode a feed. */
export function watchPlayback(video: HTMLVideoElement, callbacks: {
  onTimeout: () => void
  onLoading: () => void
  onReady: () => void
}) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastTime = video.currentTime
  let progressed = false
  const suspend = () => { clearTimeout(timer); timer = undefined }
  const arm = () => {
    suspend()
    timer = setTimeout(callbacks.onTimeout, progressed ? STALL_TIMEOUT_MS : STARTUP_TIMEOUT_MS)
  }
  const loading = () => {
    if (video.paused) return
    callbacks.onLoading()
    // Repeated waiting events must not postpone a failure indefinitely.
    if (!timer) arm()
  }
  const progress = () => {
    if (video.currentTime === lastTime) return
    lastTime = video.currentTime
    progressed = true
    callbacks.onReady()
    if (!video.paused) arm()
  }
  const pause = () => { suspend(); callbacks.onReady() }
  video.addEventListener('timeupdate', progress)
  video.addEventListener('waiting', loading)
  video.addEventListener('stalled', loading)
  video.addEventListener('play', arm)
  video.addEventListener('pause', pause)
  video.addEventListener('ended', callbacks.onTimeout)
  arm()
  return {
    autoplayBlocked: pause,
    dispose: () => {
      suspend()
      video.removeEventListener('timeupdate', progress)
      video.removeEventListener('waiting', loading)
      video.removeEventListener('stalled', loading)
      video.removeEventListener('play', arm)
      video.removeEventListener('pause', pause)
      video.removeEventListener('ended', callbacks.onTimeout)
    },
  }
}
