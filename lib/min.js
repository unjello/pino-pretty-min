const jsonParser = require('fast-json-parse')
const chalk = require('chalk')
const cliui = require('cliui')
const moment = require('moment')

const defaultOptions = {
  timeSince: false
}

module.exports = function prettyFactory (options) {
  const opts = Object.assign({}, defaultOptions, options)

  pretty.asMetaWrapper = asMetaWrapper

  return pretty

  function pretty (inputData) {
    const log = extractLog(inputData)
    if (log === null) {
      return inputData + '\n'
    }

    return parse(opts, log)
  }
}

function extractLog (inputData) {
  if (!isObject(inputData)) {
    const parsed = jsonParser(inputData)
    if (parsed.err || !isPinoLog(parsed.value)) {
      return null
    }
    return parsed.value
  } else {
    return inputData
  }
}

// method taken from James' reference prettifier: https://github.com/pinojs/pino-pretty/
function isObject (input) {
  return Object.prototype.toString.apply(input) === '[object Object]'
}

// method taken from James' reference prettifier: https://github.com/pinojs/pino-pretty/
function isPinoLog (log) {
  return log && (log.hasOwnProperty('v') && log.v === 1)
}

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

var firstTime = 0

function parse (args, obj) {
  if (typeof obj.level === 'number') obj.level = numericLabels[obj.level]
  if (!obj.message) obj.message = obj.msg

  return formatOutput(args, obj)
}

function formatOutput (args, obj) {
  const noDefaultMetadata = (val) => !['level', 'time', 'msg', 'pid', 'v', 'message', 'hostname'].includes(val)
  const filterOutMetadata = (obj) => Object.keys(obj).filter(noDefaultMetadata).reduce((a, e) => {
    a[e] = obj[e]
    return a
  }, {})
  const formatLogLevel = (obj) => ({ text: levels[obj.level].color(levels[obj.level].label), width: 4 })
  // TODO: Full timestamp vs. time since start
  const formatTimeLong = (obj) => ({
    text: '[' + moment(obj.time).format(moment.HTML5_FMT.TIME_SECONDS) + ']',
    width: 11
  })
  const pad = (n, s) => `0000000000000${n}`.substr(-s)
  const formatTimeSince = (obj) => {
    const div = {
      text: '[' + pad((firstTime === 0 ? 0 : obj.time - firstTime), 8) + ']',
      width: 11
    }
    if (firstTime === 0) {
      firstTime = obj.time
    }
    return div
  }
  const formatTime = (obj) => args.timeSince ? formatTimeSince(obj) : formatTimeLong(obj)
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

function asMetaWrapper (dest) {
  const parsed = Symbol('parsedChindings')

  if (!dest) {
    dest = process.stdout
  } else if (!dest.write) {
    throw new Error('the destination must be writable')
  }

  const pretty = this

  return {
    [Symbol.for('needsMetadata')]: true,
    lastLevel: 0,
    lastMsg: null,
    lastObj: null,
    lastLogger: null,
    write (chunk) {
      var chindings = this.lastLogger[parsed]

      if (!chindings) {
        chindings = JSON.parse('{"v":1' + this.lastLogger.chindings + '}')
        this.lastLogger[parsed] = chindings
      }

      const obj = Object.assign({
        level: this.lastLevel,
        msg: this.lastMsg,
        time: this.lastTime
      }, chindings, this.lastObj)

      const formatted = pretty(obj)
      dest.write(formatted)
    }
  }
}
