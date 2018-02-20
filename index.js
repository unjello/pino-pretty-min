const split = require('split2')
const jsonParse = require('fast-json-parse')
const chalk = require('chalk')
const cliui = require('cliui')
const moment = require('moment')

const levels = {
  'trace': { label: 'TRAC', color: chalk.gray },
  'debug': { label: 'DEBU', color: chalk.gray },
  'info': { label: 'INFO', color: chalk.blue },
  'warn': { label: 'WARN', color: chalk.yellow },
  'error': { label: 'ERRO', color: chalk.red },
  'fatal': { label: 'FATA', color: chalk.bold.red }
}

const numericLabels = {
  10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error', 60: 'fatal'
}

module.exports = function PinoPrettifierZen () {
  return split(parse)

  function parse (line) {
    var obj = jsonParse(line)
    if (!obj.value || obj.err || !obj.value.level) return line + '\n'

    obj = obj.value
    if (typeof obj.level === 'number') obj.level = numericLabels[obj.level]
    if (!obj.message) obj.message = obj.msg

    return formatOutput(obj)
  }

  function formatOutput (obj) {
    const noDefaultMetadata = (val) => !['level', 'time', 'msg', 'pid', 'v', 'message', 'hostname'].includes(val)
    const filterOutMetadata = (obj) => Object.keys(obj).filter(noDefaultMetadata).reduce((a, e) => {
      a[e] = obj[e]
      return a
    }, {})
    const formatLogLevel = (obj) => ({ text: levels[obj.level].color(levels[obj.level].label), width: 4 })
    // TODO: Full timestamp vs. time since start
    const formatTime = (obj) => ({
      text: '[' + moment(obj.time).format(moment.HTML5_FMT.TIME_SECONDS) + ']',
      width: 11
    })
    const formatMessage = (obj) => ({ text: obj.message })
    const formatPropertiesText = (level, obj, parent) => {
      return Object.entries(obj).map(o => {
        if (typeof o[1] === 'object') {
          return formatPropertiesText(level, o[1], o[0])
        } else {
          return (parent === '' ? '' : level.color(parent + '.')) + level.color(o[0]) + '=' + o[1]
        }
      }).join(' ')
    }
    const formatProperties = (level, obj, parent = '') => ({
      text: formatPropertiesText(level, obj, parent),
      align: 'right'
    })

    // TODO: remove cliui and align right myself. Just watch out for cases
    // where console width is smaller than overall width of text. Cliui properly
    // wraps both center column with message, and right column with properties.
    const ui = cliui()
    ui.div(
      formatLogLevel(obj),
      formatTime(obj),
      formatMessage(obj),
      formatProperties(levels[obj.level], filterOutMetadata(obj))
    )

    return ui.toString() + '\n'
  }
}
