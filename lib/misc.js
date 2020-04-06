const pad = require('pad')
const stringWidth = require('unicode-string-width')

const noDefaultMetadata = (val) => !['level', 'time', 'msg', 'pid', 'message', 'hostname'].includes(val)

module.exports.filterOutMetadata = (obj) => Object.keys(obj).filter(noDefaultMetadata).reduce((a, e) => {
  a[e] = obj[e]
  return a
}, {})

const consoleWidth = process.stdout.getWindowSize()[0]
module.exports.format = (level, time, message, props) => {
  const _level = pad(level, 4)
  const _time = pad(time, 10)
  const _start = `${_level} ${_time} ${message}`
  const _width = stringWidth(_start)
  const _props = props.split('\n').map((s, i) => pad(i ? consoleWidth : consoleWidth - _width - 1, s, { colors: true })).join('\n')
  return `${_start} ${_props}\n`
}
