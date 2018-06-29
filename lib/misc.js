module.exports.pad = (n, s) => `0000000000000${n}`.substr(-s)
const noDefaultMetadata = (val) => !['level', 'time', 'msg', 'pid', 'v', 'message', 'hostname', 'type'].includes(val)

module.exports.filterOutMetadata = (obj) => Object.keys(obj).filter(noDefaultMetadata).reduce((a, e) => {
  a[e] = obj[e]
  return a
}, {})
