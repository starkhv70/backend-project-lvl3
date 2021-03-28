import axios from 'axios';
import path from 'path';

const convertName = (pageUrl) => pageUrl.match(/\w*/gi)
  .filter((w) => w.length > 0)
  .join('-');

export const convertLinkToFilename = (pageUrl, fileExt = '.html') => `${convertName(pageUrl)}${fileExt}`;

export const convertLinkToDirname = (pageUrl, postfix = '_files') => `${convertName(pageUrl)}${postfix}`;

export const loadData = (url) => axios.get(url, {
  responseType: 'arraybuffer',
}).then(({ data }) => data);

export const buildPath = (outputDir, relativePath) => path.resolve(outputDir, relativePath);

export const buildResourceFilepath = (hostname, resourceDir, resourcePath) => {
  const { dir, name, ext } = path.parse(resourcePath);
  const fileExt = ext || '.html';
  const resourceFilename = convertLinkToFilename(`${hostname}${dir}/${name}`, fileExt);
  return path.join(resourceDir, resourceFilename);
};
