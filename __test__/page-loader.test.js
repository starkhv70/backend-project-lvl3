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
const pageUrl = new URL(baseUrl, relativePath);
const pageFileName = 'ru-hexlet-io-courses.html';
let tmpDir = '';
let expectedHTML = '';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fsp.readFile(getFixturePath(filename), 'utf-8');

nock.disableNetConnect();

beforeAll(async () => {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader'));
  expectedHTML = await readFile(pageFileName);
  nock(baseUrl)
    .get(relativePath)
    .reply(200, expectedHTML)
    .get(wrongRelativePath)
    .reply(404, '');
});

test('load page', async () => {
  const filepath = path.join(tmpDir, pageFileName);

  await pageLoader(pageUrl.toString(), tmpDir);
  // Хочу добавить проверку, что файл создан, но не знаю как лучше сделать
  const HTMLbody = await fsp.readFile(filepath);
  expect(HTMLbody).toEqual(expectedHTML);
});

test('Handling file systems errors', async () => {
  const inaccesibleDir = '/etc';
  const filepath = path.join(tmpDir, 'unavalible');

  expect(pageLoader(pageUrl.toString(), inaccesibleDir)).rejects.toThrow();
  expect(pageLoader(pageUrl.toString(), filepath)).rejects.toThrow();
});

test('Handling network errors', async () => {
  const badBaseUrl = 'https://localhost.io';
  const wrongPageUrl = new URL(baseUrl, wrongRelativePath);

  expect(pageLoader(badBaseUrl, tmpDir)).rejects.toThrow();
  expect(pageLoader(wrongPageUrl.toString(), tmpDir)).rejects.toThrow();
});

afterAll(async () => {
  await fsp.rmdir(tmpDir, { recursive: true });
});
