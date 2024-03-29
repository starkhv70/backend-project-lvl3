import { promises as fsp } from 'fs';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';
import {
  convertLinkToFilename,
  convertLinkToDirname,
  buildPath,
  buildResourceFilepath,
  loadData,
} from './util.js';

const log = debug('page-loader');

const tagAttributeMap = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const processResources = (origin, htmlData, resourceDir) => {
  const $ = cheerio.load(htmlData);
  const tagWithResources = Object.entries(tagAttributeMap)
    .flatMap(([tagName, attrName]) => $(`${tagName}[${attrName}]`).toArray()
      .map((tagWithAttr) => {
        const tag = $(tagWithAttr);
        const url = new URL(tag.attr(tagAttributeMap[tagName]), origin);
        return { tag, url };
      })
      .filter(({ url }) => url.origin === origin)
      .map(({ tag, url }) => {
        const filepath = buildResourceFilepath(url.hostname, resourceDir, url.pathname);
        return { tag, url, filepath };
      }));
  tagWithResources.forEach(({ tag, filepath }) => {
    const attrName = tagAttributeMap[tag.get(0).tagName];
    tag.attr(attrName, filepath);
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
  log('Input value: url: %s, download to: %s', pageLink, outputDir);
  log('Load page: %s', pageLink);
  return loadData(pageUrl.toString())
    .then((data) => {
      log('Create resource dir:', resourceDirpath);
      return fsp.mkdir(resourceDirpath)
        .then(() => processResources(pageUrl.origin, data, resourceDir));
    })
    .then(({ page, resources }) => {
      log('Save web page to file', pageFilepath);
      return fsp.writeFile(pageFilepath, page)
        .then(() => resources);
    })
    .then((resources) => {
      const tasks = resources.map(({ url, filepath }) => {
        const resourceFilepath = buildPath(outputDir, filepath);
        log('Download resource %s  to file %s', url, resourceFilepath);
        return {
          title: `Download ${url}`,
          task: () => loadData(url.toString())
            .then((data) => fsp.writeFile(resourceFilepath, data)),
        };
      });
      const listr = new Listr(tasks, { concurrent: true, exitOnError: false });
      return listr.run();
    })
    .then(() => ({ pageFilepath }));
};

export default pageLoader;
