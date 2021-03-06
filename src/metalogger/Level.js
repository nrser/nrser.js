// @flow

import _ from '//src/nodash';
import type { $Refinement, $Reify } from 'tcomb';
import * as errors from '../errors';

const LEVELS = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export const LEVEL_NAME_PAD_LENGTH = _.chain(LEVELS)
  .keys()
  .map(name => name.length)
  .max()
  .value();

const LEVEL_RANKS: Array<number> = _.values(LEVELS);

function isLevelName(string: string) {
  return _.has(LEVELS, string);
}

/**
* A string name of a {@link Level}.
* 
* @typedef {string} LevelName
*/
export type LevelName = (
  "fatal" |
  "error" |
  "warn"  |
  "info"  |
  "debug" |
  "trace"
);

/**
* tcomb type for {@link LevelName}.
* 
* @type {Type}
*/
export const tLevelName = (({}: any): $Reify<LevelName>);


function isLevelRank(number: number) {
  return _.includes(LEVEL_RANKS, number);
}

export type LevelRank = number & $Refinement<typeof isLevelRank>;

export class Level {
  name: LevelName;
  rank: LevelRank;
  
  static FATAL: Level = new Level({name: 'fatal', rank: LEVELS.fatal});
  static ERROR: Level = new Level({name: 'error', rank: LEVELS.error});
  static WARN:  Level = new Level({name: 'warn',  rank: LEVELS.warn});
  static INFO:  Level = new Level({name: 'info',  rank: LEVELS.info});
  static DEBUG: Level = new Level({name: 'debug', rank: LEVELS.debug});
  static TRACE: Level = new Level({name: 'trace', rank: LEVELS.trace});
  
  static LEVELS: Array<Level> = [
    Level.FATAL,
    Level.ERROR,
    Level.WARN,
    Level.INFO,
    Level.DEBUG,
    Level.TRACE,
  ];
  
  static forName(name: LevelName): Level {
    // flow doesn't like dynamic prop access...
    switch (name) {
      case 'fatal':
        return this.FATAL;
      case 'error':
        return this.ERROR;
      case 'warn':
        return this.WARN;
      case 'info':
        return this.INFO;
      case 'debug':
        return this.DEBUG;
      case 'trace':
        return this.TRACE;
      default:
        throw new errors.ValueError(`bad level name: ${ name }`, {name});
    }
  }
  
  constructor({name, rank}: {name: LevelName, rank: LevelRank}) {
    this.name = name;
    this.rank = rank;
  }
}
