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
let tmpDir = '';
let expectedHTML = '';

const getFixturePath = (...paths) => path.join(__dirname, '..', '__fixtures__', ...paths);
const readFile = (...paths) => fsp.readFile(getFixturePath(...paths), 'utf-8');

nock.disableNetConnect();

beforeAll(async () => {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  const originalHTML = await readFile(pageFileName);
  expectedHTML = await readFile('expected', pageFileName);
  nock(baseUrl)
    .get(relativePath)
    .reply(200, originalHTML.trim())
    .get(wrongRelativePath)
    .reply(404, '');
});

test('load page', async (done) => {
  const filepath = path.join(tmpDir, pageFileName);

  await pageLoader(pageUrl, tmpDir);
  const HTMLbody = await fsp.readFile(filepath, 'utf-8');
  expect(HTMLbody).toEqual(expectedHTML.trim());
  done();
});

test('Handling file systems errors', async () => {
  const inaccesibleDir = '/etc';
  const unavalibleFilepath = path.join(tmpDir, 'unavalible');

  expect(pageLoader(pageUrl.toString(), inaccesibleDir)).rejects.toThrow();
  expect(pageLoader(pageUrl.toString(), unavalibleFilepath)).rejects.toThrow();
});

test('Handling network errors', async () => {
  const badBaseUrl = 'https://localhost.io';
  const wrongPageUrl = new URL(wrongRelativePath, baseUrl);

  expect(pageLoader(badBaseUrl, tmpDir)).rejects.toThrow();
  expect(pageLoader(wrongPageUrl.toString(), tmpDir)).rejects.toThrow();
});

afterAll(async () => {
  await fsp.rmdir(tmpDir, { recursive: true });
});
