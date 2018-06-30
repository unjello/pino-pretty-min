const { filterOutMetadata } = require('../misc')

describe('filterOutMetadata', () => {
  it('pads small number', () => {
    const data = {
      level: 1, time: 2, msg: 3, pid: 4, v: 5, message: 6, hostname: 7, type: 8, other: 9
    }
    const filtered = filterOutMetadata(data)
    expect(Object.keys(filtered)).toHaveLength(1)
    expect(filtered.level).toBeUndefined()
    expect(filtered.other).toBe(9)
  })
})
