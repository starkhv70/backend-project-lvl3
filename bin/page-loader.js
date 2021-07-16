#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../src/page-loader.js';

program
  .version('0.0.1')
  .description('Simple CLI tool for download web page.')
  .arguments('<url>')
  .option('-o, --output [path]', 'output path for download files', process.cwd())
  .action((url) => pageLoader(url, program.output)
    .then(({ pageFilepath }) => console.log('Web page was dowloaded to file:', pageFilepath))
    .catch(({ message }) => {
      console.error(message);
      process.exit(1);
    }));

program.parse(process.argv);
