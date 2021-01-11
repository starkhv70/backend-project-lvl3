import _ from 'lodash';
import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fsp } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = async (filename) => fsp.readFile(getFixturePath(filename), 'utf-8');
