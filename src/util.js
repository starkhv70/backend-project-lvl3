import cheerio from 'cheerio';
import path from 'path';

const tagAttributeMap = {
  img: 'src',
};

const convertName = (pageUrl) => `${pageUrl.replace(/[^A-Za-z0-9]/g, '-')}`;

export const convertUrlToFilename = (pageUrl, fileExt = '.html') => `${convertName(pageUrl)}${fileExt}`;

export const convertUrlToDirname = (pageUrl, postfix = '_files') => `${convertName(pageUrl)}${postfix}`;

const buildResourceFilepath = (hostname, resourceDir, resourcePath) => {
  const { dir, name, ext } = path.parse(resourcePath);
  const resourceFilename = convertUrlToFilename(`${hostname}${dir}/${name}`, ext);
  return path.join(resourceDir, resourceFilename);
};

export const processingResources = (url, htmlData, resourceDir) => {
  const $ = cheerio.load(htmlData);
  const tags = Object.keys(tagAttributeMap);
  const tagsWithResources = tags.flatMap((tag) => $(`${tag}`).toArray());
  const localResources = tagsWithResources.map((tag) => {
    const attrName = tagAttributeMap[tag.name];
    const resourcePath = $(tag).attr(attrName);
    const resourceUrl = new URL(resourcePath, url);
    const resourceFilepath = buildResourceFilepath(url.hostname, resourceDir, resourcePath);
    $(tag).attr(attrName, resourceFilepath);
    return { resourceUrl, resourceFilepath };
  });
  return { modifiedHtml: $.html(), resources: localResources };
};
