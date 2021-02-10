import { promises as fsp } from 'fs';
import {
  convertUrlToFilename,
  convertUrlToDirname,
  buildPath,
  processingResources,
  load,
} from './util.js';

const pageLoader = (pageUrl, outputDir = process.cwd()) => {
  const { hostname, pathname } = pageUrl;
  const formattedUrl = `${hostname}${(pathname !== '/') ? pathname : ''}`;
  const pageFilename = convertUrlToFilename(formattedUrl);
  const pageFilepath = buildPath(outputDir, pageFilename);
  const resourceDir = convertUrlToDirname(formattedUrl);
  const resourceDirpath = buildPath(outputDir, resourceDir);
  return load(pageUrl.toString())
    .then((data) => fsp.mkdir(resourceDirpath)
      .then(() => processingResources(pageUrl, data, resourceDir)))
    .then(({ page, resources }) => fsp.writeFile(pageFilepath, page)
      .then(() => resources))
    .then((resources) => {
      const promises = resources.map(({ resourceUrl, relativeFilepath }) => {
        const resourceFilepath = buildPath(outputDir, relativeFilepath);
        return load(resourceUrl.toString()).then((data) => fsp.writeFile(resourceFilepath, data));
      });
      return Promise.all(promises);
    });
};

export default pageLoader;
