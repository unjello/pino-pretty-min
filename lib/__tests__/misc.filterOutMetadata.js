const { filterOutMetadata } = require('../misc')

describe('filterOutMetadata', () => {
  it('pads small number', () => {
    const data = {
      level: 1, time: 2, msg: 3, pid: 4, message: 5, hostname: 6, other: 7
    }
    const filtered = filterOutMetadata(data)
    expect(Object.keys(filtered)).toHaveLength(1)
    expect(filtered.level).toBeUndefined()
    expect(filtered.other).toBe(7)
  })
})
