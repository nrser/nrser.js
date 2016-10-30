// @flow

import _ from 'lodash';
import { Glob } from 'glob';
import path from 'path';

// package
import fs from '../../fs';

// types
import type { AbsPath } from '../types';

// re-export
export { Scheduler } from './Scheduler';
export { Pattern } from './Pattern';
export { TaskName } from './TaskName';

/**
* dumps a value to a string in a way that shouldn't ever fail. uses
* `print` if it can, falling back to node's `util.inspect`.
*/
export function dump(value: *, printOptions: Object = {}): string {
  try {
    const print = require('../../print');
    return print(value, printOptions);
    
  } catch (error) {
    const inspect = require('util').inspect;
    return inspect(value);
    
  }
}

/**
* reads the `package.json` file in the current directory to get the
* package name, falling back to the directory name.
*/
export function getPackageName(packageDir: AbsPath) {
  try {
    return fs.readJsonSync(path.join(packageDir, 'package.json')).name;
  } catch (error) {
    return path.basename(packageDir);
  }
}

/**
* returns true if the string contains glob expansion patterns.
*/
export function hasGlobPattern(s: string): boolean {
  // the empty string does not
  if (s === '') {
    return false;
  }
  
  // the set should now not be empty
  const set = (new Glob(s)).minimatch.set;
  
  // if there are multiple set arrays that means there was a brace
  // expansion and hence has glob patterns
  if (set.length > 1) {
    return true;
  }
  
  // it has glob patterns if some item in the first (and only) set item
  // is **not** a string
  return _.some(set[0], item => typeof item !== 'string');
}

