import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fsp } from 'fs';
import os from 'os';
import nock from 'nock';
import pageLoader from '../src/page-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://ru.hexlet.io';
const relativePath = '/courses';
const wrongRelativePath = '/error';
const pageUrl = new URL(relativePath, baseUrl);
const pageFileName = 'ru-hexlet-io-courses.html';
const resourceDir = 'ru-hexlet-io-courses_files';
const scope = nock(baseUrl).persist();
let tmpDir = '';
let expectedHTML = '';
let resources = [
  {
    tag: 'img',
    resourcePath: '/assets/professions/nodejs.png',
    filename: 'ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    tag: 'link',
    resourcePath: '/assets/application.css',
    filename: 'ru-hexlet-io-assets-application.css',
  },
  {
    tag: 'script',
    resourcePath: '/packs/js/runtime.js',
    filename: 'ru-hexlet-io-packs-js-runtime.js',
  },
];
const resourceFilenames = resources.map(({ filename }) => [filename]);

const getFixturePath = (...paths) => path.join(__dirname, '..', '__fixtures__', ...paths);
const readFixtureFile = (...paths) => fsp.readFile(getFixturePath(...paths), 'utf-8');

nock.disableNetConnect();

beforeAll(async () => {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  const originalHTML = await readFixtureFile(pageFileName);
  expectedHTML = await readFixtureFile('expected', pageFileName);
  scope
    .get(relativePath)
    .reply(200, originalHTML.trim())
    .get(wrongRelativePath)
    .reply(404, '');

  const promises = resources.map((resource) => readFixtureFile('expected', resourceDir, resource.filename)
    .then((data) => ({ ...resource, data })));
  resources = await Promise.all(promises);

  resources.forEach(({ resourcePath, data }) => scope.get(resourcePath).reply(200, data));
});

test('load page', async () => {
  const filepath = path.join(tmpDir, pageFileName);
  await pageLoader(pageUrl, tmpDir);
  const HTMLbody = await fsp.readFile(filepath, 'utf-8');
  expect(HTMLbody).toEqual(expectedHTML.trim());
});

test.each(resourceFilenames)('load resource to file: %s', async (filename) => {
  const filepath = path.join(tmpDir, resourceDir, filename);
  const content = await fsp.readFile(filepath, 'utf-8');
  const expectedContent = await readFixtureFile('expected', resourceDir, filename);
  expect(content).toEqual(expectedContent);
});

test('Handling file systems errors', async () => {
  const inaccesibleDir = '/etc';
  const unavalibleFilepath = '/unavalibleFilepath';

  await expect(pageLoader(pageUrl.toString(), inaccesibleDir)).rejects.toThrow();
  await expect(pageLoader(pageUrl.toString(), unavalibleFilepath)).rejects.toThrow();
});

test('Handling network errors', async () => {
  const badBaseUrl = 'https://localhost.io';
  const wrongPageUrl = new URL(wrongRelativePath, baseUrl);

  await expect(pageLoader(badBaseUrl, tmpDir)).rejects.toThrow();
  await expect(pageLoader(wrongPageUrl.toString(), tmpDir)).rejects.toThrow();
});

afterAll(async () => {
  await fsp.rmdir(tmpDir, { recursive: true, maxRetries: 5 });
});
