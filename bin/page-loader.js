#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../src/page-loader.js';

program
  .version('0.0.1')
  .description('Simple CLI tool for download web page.')
  .arguments('<pageUrl>')
  .option('-o, --output [path]', 'output path for download files', process.cwd())
  .action((pageUrl) => pageLoader(new URL(pageUrl), program.output));

program.parse(process.argv);
