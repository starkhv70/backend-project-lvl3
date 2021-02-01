import axios from 'axios';
import cheerio from 'cheerio';
import { promises as fsp } from 'fs';
import path from 'path';

const tagsToLoad = [
  {
    name: 'img',
    attr: 'src',
    responseType: 'stream',
  },
];
const convertUrlToFilename = (url, fileExt) => `${url.replace(/[^A-Za-z0-9]/g, '-')}.${fileExt}`;

const loadResources = (htmlData) => {
  const $ = cheerio.load(htmlData);
  const promises = tagsToLoad.map((tag) => {});
  return Promise.all(promises);
};

const saveResources = (resources) => {

};

const savePage = (url, outputDir, htmlData) => {
  const { hostname } = url;
  const pathname = (url.pathname !== '/') ? url.pathname : '';
  const filename = convertUrlToFilename(`${hostname}${pathname}`, 'html');
  const filepath = path.resolve(outputDir, filename);
  return fsp.writeFile(filepath, htmlData);
};

const pageLoader = (pageUrl, outputDir = process.cwd()) => {
  const url = new URL(pageUrl);

  let htmlData;
  return axios.get(url.toString())
    .then((response) => {
      htmlData = response.data;
    })
    .then(() => loadResources(htmlData))
    .then((resources) => saveResources(resources))
    .then(() => savePage(url, outputDir, htmlData));
};

export default pageLoader;
