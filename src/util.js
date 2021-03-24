import axios from 'axios';
import cheerio from 'cheerio';
import path from 'path';

const tagAttributeMap = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const convertName = (pageUrl) => pageUrl.match(/\w*/gi)
  .filter((w) => w.length > 0)
  .join('-');

export const convertLinkToFilename = (pageUrl, fileExt = '.html') => `${convertName(pageUrl)}${fileExt}`;

export const convertLinkToDirname = (pageUrl, postfix = '_files') => `${convertName(pageUrl)}${postfix}`;

export const loadData = (url) => axios.get(url, {
  responseType: 'arraybuffer',
}).then(({ data }) => data);

export const buildPath = (outputDir, relativePath) => path.resolve(outputDir, relativePath);

const buildResourceFilepath = (hostname, resourceDir, resourcePath) => {
  const { dir, name, ext } = path.parse(resourcePath);
  const fileExt = ext || '.html';
  const resourceFilename = convertLinkToFilename(`${hostname}${dir}/${name}`, fileExt);
  return path.join(resourceDir, resourceFilename);
};

export const processingResources = (origin, htmlData, resourceDir) => {
  const $ = cheerio.load(htmlData);
  const tagsWithResources = Object.keys(tagAttributeMap)
    .flatMap((tagName) => $(`${tagName}`).toArray()
      .filter((element) => {
        const url = new URL($(element).attr(tagAttributeMap[tagName]), origin);
        return url.origin === origin;
      }));

  const resources = tagsWithResources.map((tag) => {
    const attrName = tagAttributeMap[tag.name];
    const relativePath = $(tag).attr(attrName);
    const url = new URL(relativePath, origin);
    const relativeFilepath = buildResourceFilepath(url.hostname, resourceDir, url.pathname);
    $(tag).attr(attrName, relativeFilepath);
    return { url, relativeFilepath };
  });
  return { page: $.html(), resources };
};
