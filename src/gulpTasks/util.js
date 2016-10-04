import _ from 'lodash';
import glob2base from 'glob2base';
import { Glob } from 'glob';

export type FilePath = string;

export type DirPath = string;

export class Src {
  pattern: string;
  base: string;
  
  constructor(pattern, base = glob2base(new Glob(pattern))) {
    this.pattern = pattern;
    this.base = base;
  }
}

