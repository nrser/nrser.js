// @flow

// system
import util from 'util';
import {
  exec as sysExec,
  execSync as sysExecSync,
  spawn,
  spawnSync,
  ChildProcess,
} from 'child_process';

// deps
import shellescape from 'shell-escape';
import _ from 'lodash';
import Promise from 'promise';
import untildifyImport from 'untildify';

// package
import { squish, tag, deindent } from './string';
import print from './print';
import * as errors from './errors';

// types

/**
* @see https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options
*/
export type SpawnResult = {
  pid: number, // Pid of the child process
  // TODO are these strings?
  output: Array<*>, // Array of results from stdio output
  stdout: Buffer | string, // The contents of output[1]
  stderr: Buffer | string, // The contents of output[2]
  status: number, // The exit code of the child process
  signal: string, // The signal used to kill the child process
  error: Error, // The error object if the child process failed or timed out
}

export type CmdOptions = {
  // common
  cwd?: string;
  env?: Object;
  encoding?: string;
  maxBuffer?: number;
  timeout?: number;
  killSignal?: string;
  uid?: number;
  gid?: number;
  
  // exec options
  shell?: string;
  
  // exec sync options
  input?: string | Buffer;
  stdio?: Array<any>;
  
  // spawn options
  detached?: boolean;
  
  // package options
  trim: boolean;
  sync: boolean;
};

// re-exports
export const untildify = untildifyImport;

export function chdir<T>(
  dest: string,
  block?: () => T,
): ?T {
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

export function execSync(
  cmd: string,
  options?: Object = {encoding: 'utf8', trim: true}
): string {
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
export function esc(strings: Array<string>, ...values: Array<*>): string {
  return squish(escTag(strings, ...values));
}

// old name
export const sh = esc;

const putsTag = tag(s => typeof s === 'string' ? s : print(s));

export function puts(strings: Array<string>, ...values: Array<*>): void {
  console.log(deindent(putsTag(strings, ...values)));
}

export const p = puts;

export class Cmd {
  options: CmdOptions;
  
  /**
  * handles input, which may come from a direct call or usage as a template
  * literal.
  */
  static getCmdStr(
    strings: string | Array<string>,
    ...values: Array<*>
  ): string {
    // if we were fed a string just return that
    if (typeof strings === 'string') {
      return strings;
    }
    
    if (values.length === 0) {
      // if there weren't any values, join the strings and squish the results
      return squish(strings.join(' '));
    }
    
    // otherwise, escape the values as a template literal tag
    return esc(strings, ...values);
  }
  
  constructor(options: Object = {}) {
    this.options = {
      ...{encoding: 'utf8', trim: true, sync: true},
      ...options,
    };
  }
  
  out(
    strings: string | Array<string>,
    ...values: Array<*>
  ): string | Promise<string> {
    const cmdStr = this.constructor.getCmdStr(strings, ...values);
    
    if (this.options.sync) {
      return sysExecSync(cmdStr, {
        cwd: this.options.cwd,
        input: this.options.input,
        stdio: this.options.stdio,
        env: this.options.env,
        encoding: this.options.encoding,
        timeout: this.options.timeout,
        maxBuffer: this.options.maxBuffer,
        killSignal: this.options.killSignal,
        uid: this.options.uid,
        gid: this.options.gid,
      });
      
    } else {
      return Promise.denodify(sysExec(cmdStr, {
        cwd: this.options.cwd,
        env: this.options.env,
        encoding: this.options.encoding,
        shell: this.options.shell,
        timeout: this.options.timeout,
        maxBuffer: this.options.maxBuffer,
        killSignal: this.options.killSignal,
        uid: this.options.uid,
        gid: this.options.gid,
      }));
      
    }
  }
  
  p(
    strings: string | Array<string>,
    ...values: Array<*>
  ): void {
    if (!this.options.sync) {
      throw new errors.NrserError("#p doesn't support async (yet)");
    }
    
    console.log(this.out(strings, ...values));
  }
  
  spawn(
    strings: string | Array<string>,
    ...values: Array<*>
  ): SpawnResult | ChildProcess {
    const cmdStr = this.constructor.getCmdStr(strings, ...values);
    
    if (this.options.sync) {
      const result: SpawnResult = spawnSync(cmdStr, {
        cwd: this.options.cwd,
        env: this.options.env,
        stdio: this.options.stdio,
        detached: this.options.detached,
        uid: this.options.uid,
        gid: this.options.gid,
      });
      return result;
      
    } else {
      const child: ChildProcess = spawn(cmdStr, {
        cwd: this.options.cwd,
        env: this.options.env,
        stdio: this.options.stdio,
        detached: this.options.detached,
        uid: this.options.uid,
        gid: this.options.gid,
      });
      return child;
      
    }
  }
  
  kexec(
    strings: string | Array<string>,
    ...values: Array<*>
  ): void {
    require('kexec')(this.constructor.getCmdStr(strings, ...values));
  }
}

export function cmd(options: Object) {
  return new Cmd(options);
}

cmd.out = function(
  strings: string | Array<string>,
  ...values: Array<*>
): string {
  return new Cmd().out(strings, ...values);
}

cmd.p = function(
  strings: string | Array<string>,
  ...values: Array<*>
): void {
  return new Cmd().p(strings, ...values);
}

cmd.kexec = function(
  strings: string | Array<string>,
  ...values: Array<*>
): void {
  new Cmd().kexec(strings, ...values);
}
