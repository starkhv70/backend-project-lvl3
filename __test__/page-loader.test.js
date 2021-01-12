import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fsp } from 'fs';
import nock from 'nock';
import pageLoader from '../src/page-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = async (filename) => fsp.readFile(getFixturePath(filename), 'utf-8');

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('should load simple html page', async () => {
  const HTMLbody = await readFile('ru-hexlet-io-courses.html');
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, HTMLbody);
});
