#! /usr/bin/env node
const fs = require('fs')
const pump = require('pump')
const args = require('args')
const split = require('split2')
const through = require('through2')
const prettyFactory = require('./lib')

args
  .option(['t', 'timeSince'], 'Use time since first log, rather than timestamp')
  .option(['s', 'stackTrace'], 'Highlight stack traces')

args
  .example('node example.js | pino-pretty-min', 'To prettify logs, simply pipe a log through')

const opts = args.parse(process.argv)
const pretty = prettyFactory(opts)
const prettyTransport = through.obj(function (chunk, enc, cb) {
  process.stdout.write(pretty(chunk.toString()))
  cb()
})

pump(
  process.stdin,
  split(),
  prettyTransport
)

if (!process.stdin.isTTY && !fs.fstatSync(process.stdin.fd).isFile()) {
  process.once('SIGINT', function noOp () {})
}
