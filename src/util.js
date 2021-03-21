import axios from 'axios';
import cheerio from 'cheerio';
import path from 'path';

const tagAttributeMap = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const convertName = (pageUrl) => `${pageUrl.replace(/[^A-Za-z0-9]/g, '-')}`;

export const convertUrlToFilename = (pageUrl, fileExt = '.html') => `${convertName(pageUrl)}${fileExt}`;

export const convertUrlToDirname = (pageUrl, postfix = '_files') => `${convertName(pageUrl)}${postfix}`;

export const load = (url) => axios.get(url, {
  responseType: 'arraybuffer',
}).then(({ data }) => data);

export const buildPath = (outputDir, relativePath) => path.resolve(outputDir, relativePath);

const buildResourceFilepath = (hostname, resourceDir, resourcePath) => {
  const { dir, name, ext } = path.parse(resourcePath);
  const resourceFilename = convertUrlToFilename(`${hostname}${dir}/${name}`, ext);
  return path.join(resourceDir, resourceFilename);
};

export const processingResources = (pageurl, htmlData, resourceDir) => {
  const $ = cheerio.load(htmlData);
  const tags = Object.keys(tagAttributeMap);
  const tagsWithResources = tags.flatMap((tag) => $(`${tag}`).toArray());
  const resources = tagsWithResources.map((tag) => {
    const attrName = tagAttributeMap[tag.name];
    const relativePath = $(tag).attr(attrName);
    const resourceUrl = new URL(relativePath, pageurl);
    const relativeFilepath = buildResourceFilepath(pageurl.hostname, resourceDir, relativePath);
    $(tag).attr(attrName, relativeFilepath);
    return { resourceUrl, relativeFilepath };
  });
  return { page: $.html(), resources };
};
