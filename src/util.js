import cheerio from 'cheerio';

const tagAttributeMap = {
  img: 'src',
};

const convertName = (pageUrl) => `${pageUrl.replace(/[^A-Za-z0-9]/g, '-')}`;

export const convertUrlToFilename = (pageUrl, fileExt = 'html') => `${convertName(pageUrl)}.${fileExt}`;

export const convertUrlToDirname = (pageUrl, postfix = '_files') => `${convertName(pageUrl)}${postfix}`;

export const processingResources = (url, htmlData, resourceDir) => {

};
