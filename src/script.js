import shellescape from 'shell-escape';
import _ from 'lodash';
import { execSync as sysExecSync } from 'child_process';
import util from 'util';
import Promise from 'promise';

import { squish, tag, deindent } from './string.js';
import print from './print';

export untildify from 'untildify';


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

// tags
// ====

/**
* string tag to shell escape interpolations.
* 
* @type {function(strings:string[], ...values):string}
*/
const escTag = tag(string => shellescape([string]));

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
export function esc(strings, ...values) {
  return squish(escTag(strings, ...values));
}

// old name
export const sh = esc;

const putsTag = tag(s => _.isString(s) ? s : print(s));

export function puts(strings, ...values) {
  console.log(deindent(putsTag(strings, ...values)));
}

export const p = puts;

export class Cmd {
  constructor(options = {}) {
    this.options = {
      ...{encoding: 'utf8', trim: true, sync: true},
      ...options,
    };
  }
  
  out(strings, ...values) {
    const cmd = esc(strings, ...values);
    if (this.options.sync) {
      return sysExecSync(cmd, this.options);
    } else {
      return Promise.denodify(sysExec(cmd, this.options));
    }
  }
  
  p(strings, ...values) {
    console.log(this.out(strings, ...values));
  }
  
  spawn(strings, ...values) {
    const cmd = esc(strings, ...values);
    if (this.options.sync) {
      return spawnSync(cmd, this.options);
    } else {
      
    }
  }
  
  kexec(strings, ...values) {
    require('kexec')(esc(strings, ...values));
  }
}

export function cmd(options) {
  return new Cmd(options);
}

cmd.out = function(strings, ...values) {
  return new Cmd().out(strings, ...values);
}

cmd.p = function(strings, ...values) {
  return new Cmd().p(strings, ...values);
}

cmd.kexec = function(strings, ...values) {
  new Cmd().kexec(strings, ...values);
}
