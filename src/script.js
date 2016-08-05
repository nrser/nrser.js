import shellescape from 'shell-escape';
import _ from 'lodash';
import { execSync as sysExecSync } from 'child_process';

import { squish, tag } from './string.js';

/**
* string tag to shell escape interpolations.
* 
* @type {function(strings:string[], ...values):string}
*/
const shTag = tag(string => shellescape([string]));

/**
* string template tag to shell escape values.
*
* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
* 
* @param {string[]} strings
*   array of string literals in template.
* 
* @param {...object} values
*   values to interpolate.
* 
* @return {string} shell escaped string.
*/
export function sh(strings, ...values) {
  return squish(shTag(strings, ...values));
}

export function chdir(dest, block) {
  if (block) {
    const cwd = process.cwd();
    let result;
    process.chdir(dest);
    try {
      result = block();
    } finally {
      process.chdir(cwd);
    }
    return result;
  } else {
    process.chdir(dest);
  }
}

export function execSync(cmd, options = {encoding: 'utf8', trim: true}) {
  const output = sysExecSync(cmd, _.omit(options, ['trim']));
  if (options.trim) {
    return output.trim();
  } else {
    return output;
  }
}