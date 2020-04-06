'use strict'

const jsonParser = require('fast-json-parse')
const chalk = require('chalk')
const moment = require('moment')
const { filterOutMetadata, format } = require('./misc')
const pad = require('pad')

const defaultOptions = {
  timeSince: false,
  stackTrace: false
}

const levels = {
  trace: { label: 'TRAC', color: chalk.gray },
  debug: { label: 'DEBU', color: chalk.gray },
  info: { label: 'INFO', color: chalk.blue },
  warn: { label: 'WARN', color: chalk.yellow },
  error: { label: 'ERRO', color: chalk.red },
  fatal: { label: 'FATA', color: chalk.bold.red }
}

const numericLabels = {
  10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error', 60: 'fatal'
}

module.exports = options => {
  const opts = Object.assign({}, defaultOptions, options)
  var firstTime = 0

  return inputData => {
    const log = extractLog(inputData)
    if (log === null) {
      return inputData + '\n'
    }

    return parse(opts, log)
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

  function isPinoLog (log) {
    return log && 'level' in log && 'msg' in log &&
      'time' in log && 'pid' in log && 'hostname' in log
  }

  function parse (args, obj) {
    if (typeof obj.level === 'number') obj.level = numericLabels[obj.level]
    if (!obj.message) obj.message = obj.msg

    return formatOutput(args, obj)
  }

  function formatOutput (args, obj) {
    const formatLogLevel = (obj) => levels[obj.level].color(levels[obj.level].label)
    const formatTimeLong = (obj) => '[' + moment(obj.time).format(moment.HTML5_FMT.TIME_SECONDS) + ']'

    const formatTimeSince = (obj) => {
      const div = '[' + pad(8, (firstTime === 0 ? 0 : obj.time - firstTime), '0') + ']'
      if (firstTime === 0) {
        firstTime = obj.time
      }
      return div
    }
    const formatTime = (obj) => args.timeSince ? formatTimeSince(obj) : formatTimeLong(obj)
    const formatMessage = (obj) => obj.message
    const formatPropertiesText = (level, obj, parent) => {
      return Object.entries(obj).map(o => {
        if (typeof o[1] === 'object') {
          return formatPropertiesText(level, o[1], o[0])
        } else {
          const v = o[0] === 'stack' && opts.stackTrace ? chalk.red.underline.bold(o[1]) : o[1]
          return (parent === '' ? '' : level.color(parent + '.')) + level.color(o[0]) + '=' + v
        }
      }).join(' ')
    }
    const formatProperties = (level, obj, parent = '') => formatPropertiesText(level, obj, parent)

    return format(
      formatLogLevel(obj),
      formatTime(obj),
      formatMessage(obj),
      formatProperties(levels[obj.level], filterOutMetadata(obj))
    )
  }
}
