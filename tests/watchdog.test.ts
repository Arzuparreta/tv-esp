import { afterEach, describe, expect, it, vi } from 'vitest'
import { watchPlayback, STARTUP_TIMEOUT_MS, STALL_TIMEOUT_MS } from '../src/lib/playbackWatchdog'

function setup() {
  vi.useFakeTimers()
  const target = Object.assign(new EventTarget(), { currentTime: 0, paused: false })
  const callbacks = { onTimeout: vi.fn(), onLoading: vi.fn(), onReady: vi.fn() }
  const watchdog = watchPlayback(target as unknown as HTMLVideoElement, callbacks)
  return { target, callbacks, watchdog }
}
afterEach(() => vi.useRealTimers())

describe('playback watchdog', () => {
  it('fails a source that never starts, even without a fatal HLS error', () => {
    const { callbacks } = setup()
    vi.advanceTimersByTime(STARTUP_TIMEOUT_MS)
    expect(callbacks.onTimeout).toHaveBeenCalledOnce()
  })
  it('requires advancing video time and does not let waiting events hide a stall', () => {
    const { target, callbacks } = setup()
    target.currentTime = 1
    target.dispatchEvent(new Event('timeupdate'))
    vi.advanceTimersByTime(STALL_TIMEOUT_MS - 1)
    target.dispatchEvent(new Event('waiting'))
    target.dispatchEvent(new Event('timeupdate'))
    vi.advanceTimersByTime(1)
    expect(callbacks.onTimeout).toHaveBeenCalledOnce()
  })
  it('keeps a progressing broadcast alive', () => {
    const { target, callbacks } = setup()
    for (let second = 1; second < 40; second++) {
      vi.advanceTimersByTime(1000)
      target.currentTime = second
      target.dispatchEvent(new Event('timeupdate'))
    }
    expect(callbacks.onTimeout).not.toHaveBeenCalled()
  })
  it('does not skip a source while paused or blocked by autoplay policy', () => {
    const { target, callbacks, watchdog } = setup()
    watchdog.autoplayBlocked()
    vi.advanceTimersByTime(60000)
    expect(callbacks.onTimeout).not.toHaveBeenCalled()
    target.dispatchEvent(new Event('play'))
    target.currentTime = 1
    target.dispatchEvent(new Event('timeupdate'))
    target.paused = true
    target.dispatchEvent(new Event('pause'))
    target.dispatchEvent(new Event('waiting'))
    vi.advanceTimersByTime(60000)
    expect(callbacks.onTimeout).not.toHaveBeenCalled()
  })
  it('removes old timers and events on channel changes', () => {
    const { target, callbacks, watchdog } = setup()
    watchdog.dispose()
    target.dispatchEvent(new Event('play'))
    vi.advanceTimersByTime(60000)
    expect(callbacks.onTimeout).not.toHaveBeenCalled()
  })
})
