const { pad } = require('../misc')

describe('pad', () => {
  it('pads small number', () => {
    expect(pad(1, 2)).toBe('01')
  })
  it('pads big number that fits', () => {
    expect(pad(999, 5)).toBe('00999')
  })
})
