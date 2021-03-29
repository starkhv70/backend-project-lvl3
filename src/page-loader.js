import { promises as fsp } from 'fs';
import cheerio from 'cheerio';
import {
  convertLinkToFilename,
  convertLinkToDirname,
  buildPath,
  buildResourceFilepath,
  loadData,
} from './util.js';

const tagAttributeMap = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const processResources = (origin, htmlData, resourceDir) => {
  const $ = cheerio.load(htmlData);
  const tagWithResources = Object.keys(tagAttributeMap)
    .flatMap((tagName) => $(tagName).toArray()
      .map((tag) => {
        const url = new URL($(tag).attr(tagAttributeMap[tagName]), origin);
        return { tag, url };
      })
      .filter(({ url }) => url.origin === origin)
      .map(({ tag, url }) => {
        const filepath = buildResourceFilepath(url.hostname, resourceDir, url.pathname);
        return { tag, url, filepath };
      }));
  tagWithResources.forEach(({ tag, filepath }) => {
    const attrName = tagAttributeMap[tag.name];
    $(tag).attr(attrName, filepath);
  });
  const resources = tagWithResources.map(({ url, filepath }) => ({ url, filepath }));
  return { page: $.html(), resources };
};

const pageLoader = (pageLink, outputDir = process.cwd()) => {
  const pageUrl = new URL(pageLink);
  const link = `${pageUrl.hostname}${pageUrl.pathname}`;
  const pageFilename = convertLinkToFilename(link);
  const pageFilepath = buildPath(outputDir, pageFilename);
  const resourceDir = convertLinkToDirname(link);
  const resourceDirpath = buildPath(outputDir, resourceDir);
  return loadData(pageUrl.toString())
    .then((data) => fsp.mkdir(resourceDirpath)
      .then(() => processResources(pageUrl.origin, data, resourceDir)))
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
