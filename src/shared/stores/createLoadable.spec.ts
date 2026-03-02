import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLoadable } from './createLoadable'

describe('createLoadable', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('runs task and sets hasLoaded on success', async () => {
    const loadable = createLoadable()
    const task = vi.fn().mockResolvedValue(undefined)

    await loadable.run(task)

    expect(task).toHaveBeenCalledTimes(1)
    expect(loadable.hasLoaded.value).toBe(true)
    expect(loadable.isLoading.value).toBe(false)
    expect(loadable.error.value).toBeNull()
  })

  it('sets error on failure', async () => {
    const loadable = createLoadable()
    const task = vi.fn().mockRejectedValue(new Error('Network error'))

    await loadable.run(task)

    expect(loadable.error.value).toBe('Network error')
    expect(loadable.isLoading.value).toBe(false)
    expect(loadable.hasLoaded.value).toBe(false)
  })

  it('handles non-Error rejection', async () => {
    const loadable = createLoadable()
    const task = vi.fn().mockRejectedValue('string error')

    await loadable.run(task)

    expect(loadable.error.value).toBe('Failed to load data.')
  })

  it('skips when already loading', async () => {
    const loadable = createLoadable()
    const task = vi.fn().mockImplementation(() => new Promise((r) => setTimeout(r, 100)))

    const p1 = loadable.run(task)
    const p2 = loadable.run(task)

    await Promise.all([p1, p2])

    expect(task).toHaveBeenCalledTimes(1)
  })

  it('skips when hasLoaded and force is false', async () => {
    const loadable = createLoadable()
    const task = vi.fn().mockResolvedValue(undefined)

    await loadable.run(task)
    await loadable.run(task)

    expect(task).toHaveBeenCalledTimes(1)
  })

  it('runs again when force is true', async () => {
    const loadable = createLoadable()
    const task = vi.fn().mockResolvedValue(undefined)

    await loadable.run(task)
    await loadable.run(task, true)

    expect(task).toHaveBeenCalledTimes(2)
  })
})
