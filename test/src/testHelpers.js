import path from 'path';

import { Logger } from '../../lib/metalogger';

export const PROJECT_ROOT = path.normalize(
  path.join(__dirname, '..', '..')
);

export function resolve(...paths: Array<string>): string {
  return path.resolve(PROJECT_ROOT, ...paths);
}

export const SRC_DIR = resolve('src');

global.LOGGER = new Logger({
  notifTitle: 'nrser tests',
});

global.METALOG = LOGGER.log.bind(LOGGER);

export chai, { expect } from 'chai';
export { itMaps } from '../../lib/testing';

// global.context = 