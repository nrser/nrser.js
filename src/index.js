// @flow

import { IS_NODE, IS_BROWSER } from './env';

export * from './env.js';

export * from './errors';
export * from './Deferred';
export * from './object';
export * from './string';
export * from './collection';
export * from './match';

// our types extend tcomb's
import tcomb from 'tcomb';
import * as nrserTypes from './types';

export const types = {
  ...tcomb,
  ...nrserTypes,
}
export const t = types;

export { default as print } from './print';
export * as metalogger from './metalogger';

export * as path from './path';

export let fs;

if (IS_NODE) {
  fs = require('./fs').default;
}
