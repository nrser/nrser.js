import _ from 'lodash';
import { Glob } from 'glob';
import glob2base from 'glob2base';

import type { AbsPath } from '../types';

export class Src {
  pattern: AbsPath;
  base: AbsPath;
  
  constructor(
    pattern: AbsPath,
    base: AbsPath = glob2base(new Glob(pattern))
  ) {
    this.pattern = pattern;
    this.base = _.trimEnd(base, '/');
  }
}