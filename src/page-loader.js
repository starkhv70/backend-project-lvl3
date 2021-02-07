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
  let page;
  return axios.get(url.toString())
    .then(({ data }) => {
      const { modifiedHtml, resources } = processingResources(url, data, resourceDir);
      page = modifiedHtml;
      return fsp.mkdir(resourceDirpath).then((localResources) => resources);
    })
    .then(() => fsp.writeFile(pageFilepath, page));
};

export default pageLoader;
