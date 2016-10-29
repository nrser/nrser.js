// deps
import _ from 'lodash';
import chai, { expect } from 'chai';

// package
import * as path from '../../lib/path';
import { Logger } from '../../lib/metalogger';

// configure metalogger
global.LOGGER = new Logger({
  notifTitle: 'nrser tests',
});

global.METALOG = LOGGER.log.bind(LOGGER);

// re-exports
export chai, { expect } from 'chai';
export { itMaps, Expect } from '../../lib/testing';
export _ from 'lodash';
export * as path from '../../lib/path';

export const PROJECT_ROOT = path.normalize(
  path.join(__dirname, '..', '..')
);

export function resolve(...paths: Array<string>): string {
  return path.resolve(PROJECT_ROOT, ...paths);
}

export const SRC_DIR = resolve('src');

