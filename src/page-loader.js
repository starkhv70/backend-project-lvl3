import axios from 'axios';
import { promises as fsp } from 'fs';
import path from 'path';

const convertUrlToFilename = (url) => {
  const { hostname } = url;
  const pathname = (url.pathname !== '/') ? url.pathname : '';
  return `${`${hostname}${pathname}`.replace(/(\/|\.)/g, '-')}.html`;
};

const pageLoader = (pageUrl, outputDir = process.cwd()) => {
  const url = new URL(pageUrl);
  return axios.get(url.toString())
    .then((response) => {
      const filename = convertUrlToFilename(url);
      const filepath = path.join(outputDir, filename);
      console.log(filepath);
      fsp.writeFile(filepath, response.data);
    });
};

export default pageLoader;
