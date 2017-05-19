// @flow

// re-exports
// ==========
// 
// the idea is to let dependent packages just use the versions from here,
// automatically keeping them on the same version w/o having to go around
// upgrading everywhere to prevent multiple versions of libraries getting
// installed - just upgrade the nrser version and then dependent libs address
// compatibility when upgrading nrser.
// 
// this should (hopefully) help keep everything in sync easier.
// 
// dependencies not re-exported are incorporated into other exports.
// 
export { default as chalk } from 'chalk';
export { default as Promise } from 'bluebird';
export { default as minimatch } from 'minimatch';

import { IS_NODE, IS_BROWSER } from './env';

export * from './env.js';

export * from './errors';
export * from './Deferred';
export * from './object';
export * from './string';
export * from './collection';
export * from './match';
export * from './array';
export _ from './nodash';

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

export * as Path from './path';
// legacy
export * as path from './path';

export let FS;
// legacy
export let fs;

if (IS_NODE) {
  FS = fs = require('./fs').default;
}
