import axios from 'axios';
import { promises as fsp } from 'fs';
import path from 'path';

const convertUrlToFilename = (pageUrl) => {
  const url = new URL(pageUrl);
  const hostname = url.hostname.replace('//./g', '-');
  const pathname = url.pathname.replace('///g', '-');
  return `${hostname}${pathname}.html`;
};

const pageLoader = (pageUrl, outputDir = process.cwd()) => {
  axios.get(pageUrl)
    .then((response) => {
      const filename = convertUrlToFilename(pageUrl);
      const filepath = path.join(outputDir, filename);
      fsp.writeFile(filepath, response.data);
    });
};

export default pageLoader;
