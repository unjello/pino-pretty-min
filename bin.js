#! /usr/bin/env node
const mri = require('mri')
const prettify = require('./')()

const input = process.stdin
const output = process.stdout

const args = mri(process.argv.slice(2), { default: { t: false } })

input
  .pipe(prettify(args))
  .pipe(output)
