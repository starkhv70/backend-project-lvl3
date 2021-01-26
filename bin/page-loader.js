#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../src/page-loader.js';

program
  .version('0.0.1')
  .description('Simple CLI tool for download web page.')
  .helpOption('-h, --help', 'output usage information')
  .arguments('<url>')
  .option('-o, --output [path]', 'output path for download file')
  .action((url) => pageLoader(url, program.output));

program.parse(process.argv);
