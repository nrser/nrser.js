import { IS_NODE, IS_BROWSER } from './env.js';

export * from './env.js';

export const types = require('./types.js');
export const t = types;

export * from './errors';
export * from './css.js';
export * from './Logger.js';
export * from './object.js';
export * from './string.js';
export * from './match.js';

export let fs;

if (IS_NODE) {
  fs = require('fs-extra');
}
