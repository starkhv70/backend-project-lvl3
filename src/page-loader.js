import { promises as fsp } from 'fs';
import {
  convertLinkToFilename,
  convertLinkToDirname,
  buildPath,
  processingResources,
  loadData,
} from './util.js';

const pageLoader = (pageUrl, outputDir = process.cwd()) => {
  const link = `${pageUrl.hostname}${pageUrl.pathname}`;
  const pageFilename = convertLinkToFilename(link);
  const pageFilepath = buildPath(outputDir, pageFilename);
  const resourceDir = convertLinkToDirname(link);
  const resourceDirpath = buildPath(outputDir, resourceDir);
  return loadData(pageUrl.toString())
    .then((data) => fsp.mkdir(resourceDirpath)
      .then(() => processingResources(pageUrl.origin, data, resourceDir)))
    .then(({ page, resources }) => fsp.writeFile(pageFilepath, page)
      .then(() => resources))
    .then((resources) => {
      const promises = resources.map(({ url, filepath }) => {
        const resourceFilepath = buildPath(outputDir, filepath);
        return loadData(url.toString()).then((data) => fsp.writeFile(resourceFilepath, data));
      });
      return Promise.all(promises);
    });
};

export default pageLoader;
