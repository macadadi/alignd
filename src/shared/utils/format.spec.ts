import { describe, it, expect } from 'vitest'
import { pluralize } from './format'

describe('pluralize', () => {
  it('returns singular form when count is 1', () => {
    expect(pluralize(1, 'linked provider', 'linked providers')).toBe('1 linked provider')
  })

  it('returns plural form when count is not 1', () => {
    expect(pluralize(2, 'linked provider', 'linked providers')).toBe('2 linked providers')
    expect(pluralize(0, 'patient', 'patients')).toBe('0 patients')
  })
})
