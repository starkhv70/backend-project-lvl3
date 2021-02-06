import axios from 'axios';
import { promises as fsp } from 'fs';
import path from 'path';
import { convertUrlToFilename, convertUrlToDirname, processingResources } from './util.js';

const pageLoader = (url, outputDir = process.cwd()) => {
  const pageUrl = `${url.hostname}${(url.pathname !== '/') ? url.pathname : ''}`;
  const pageFilename = convertUrlToFilename(pageUrl);
  const pageFilepath = path.resolve(outputDir, pageFilename);
  const resourceDir = convertUrlToDirname(pageUrl);
  const resourceDirpath = path.resolve(outputDir, resourceDir);
  let htmlData;
  return axios.get(url.toString())
    .then(({ data }) => {
      htmlData = data;
      const localresources = processingResources(htmlData, url);
      return fsp.mkdir(resourceDirpath).then((resources) => localresources);
    })
    .then(() => fsp.writeFile(pageFilepath, htmlData));
};

export default pageLoader;
