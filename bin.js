#! /usr/bin/env node
const prettify = require('./')()
const input = process.stdin
const output = process.stdout

input
  .pipe(prettify)
  .pipe(output)
