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

export const types = require('./types');
export const t = types;

export const data = require('./data');
export const d = data;

export let fs;

if (IS_NODE) {
  fs = require('fs-extra');
}
