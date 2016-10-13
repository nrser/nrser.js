// @flow

import lodash from 'lodash';

export const _ = lodash;

import { IS_NODE, IS_BROWSER } from './env.js';

export * from './env.js';

export * from './errors';
export * from './css.js';
export * from './Logger.js';
export * from './object.js';
export * from './string.js';
export * from './match.js';

export * as types from './types';
export * as t from './types';

export * as data from './data';
export * as d  from './data';

export { default as print } from './print';
export * as metalogger from './metalogger';

export * as path from './path';

export let fs;

if (IS_NODE) {
  fs = require('./fs');
}
