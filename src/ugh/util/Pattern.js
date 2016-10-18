// @flow

// system
import path from 'path';

// deps
import _ from 'lodash';
import { Glob } from 'glob';
import glob2base from 'glob2base';

// package
import fs from '../../fs';
import * as errors from '../../errors';

import { hasGlobPattern } from '.';

import type { AbsPath, AbsDir } from '../types';

export class Pattern {
  base: AbsDir;
  pattern: string;
  
  static fromPath(path: AbsPath): Pattern {
    if (!hasGlobPattern(path)) {
      throw new errors.ValueError(`path must have glob pattern`, {path});
    }
    
    const base = glob2base(new Glob(path));
    
    fs.ensureDirSync(base);
    
    const pattern = path.substring(base.length);
    
    return new Pattern({pattern, base});
  }
  
  constructor({
    pattern,
    base,
  }: {
    pattern: string,
    base: AbsDir,
  }) {
    this.pattern = _.trimStart(pattern, '/');
    this.base = _.trimEnd(base, '/');
  }
  
  get path(): AbsPath {
    return path.join(this.base, this.pattern);
  }
  
  /**
  * see if this pattern matches a filepath.
  */
  match(filepath: AbsPath): boolean {
    const glob: Glob = new Glob(this.path);
    
    return glob.minimatch.match(filepath);
  }
}