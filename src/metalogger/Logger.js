/**
* new logger for use with babel-plugin-metalog
* 
* adapted from nrser.Logger, which was adapted from pince
* 
* https://github.com/mad-eye/pince
* 
*/

import _ from 'lodash';
import t from 'tcomb';
import minimatch from 'minimatch';
import print from 'print';

import { IS_NODE } from './env';

import { Level, LEVEL_NAME_PAD_LENGTH } from './Level';
import type { LevelName } from './Level';
import { LevelSpec } from './LevelSpec';
import type { SpecQuery, SpecProps } from './LevelSpec';

// optional requires that may or may not be present

let clc;
try {
  clc = require('cli-color');
} catch (e) {}

let notifier;
try {
  notifier = require('node-notifier');
} catch (e) {}

let inspect;
try {
  inspect = require('util').inspect;
} catch (e) {} 

// types
// =====

type MetalogMessage = {
  values: boolean,
  level: LevelName,
  filename: string,
  filepath: string,
  content: Array<*>,
  line: number,
  parentPath: Array<string>,
  notif: boolean,
};

// constants
// =========

const IDENTITY = function(x) { return x; };

const COLORS = (IS_NODE && clc) ? {
  error: clc.red.bold,
  warn: clc.yellow,
  info: clc.bold,
  debug: clc.blueBright,
  trace: clc.blackBright,
} : {
  error: IDENTITY,
  warn: IDENTITY,
  info: IDENTITY,
  debug: IDENTITY,
  trace: IDENTITY,
};

const DATE_FORMAT_TOKENS = {
  'YYYY': (d) => { return pad(d.getFullYear(), 4) },
  'MM': (d) => { return pad(d.getMonth(), 2) },
  'DD': (d) => { return pad(d.getDate(), 2) },
  'HH': (d) => { return pad(d.getHours(), 2) },
  'mm': (d) => { return pad(d.getMinutes(), 2) },
  'ss': (d) => { return pad(d.getSeconds(), 2) },
  'SSS': (d) => { return pad(d.getMilliseconds(), 3) },
};

const FORMAT_TOKENS = {
  '%T': (data) => { return data.formattedTimestamp },
  '%L': (data) => { return COLORS[data.level](data.level) },
  '%N': (data) => { return data.name },
  '%M': (data) => { return data.messages[0] },
  '%D': (data) => {
    let delta = 0;
    if (Logger.lastOutputTimestamp) {
      delta = data.timestamp - Logger.lastOutputTimestamp;
      if (delta > 10000) {
        delta = 9999;
      }
    }
    return pad(delta, 4) + "ms";
  },
};

export class MetaLogger {
  lastOutputTimestamp: ?Date;
  specs: Array<LevelSpec>;
  format: string;
  dateFormat: string;
  
  // static methods
  // ==============
  
  static formatDate(date, formatStr = dateFormatStr) {
    let str = formatStr;
    _.each(DATE_FORMAT_TOKENS, (valueFn, token) => {
      const value = valueFn(date);
      str = str.replace(token, value);
    });
    return str;
  }
  
  static formatLog(data, formatStr = formatStr) {
    let str = formatStr;
    _.each(FORMAT_TOKENS, (valueFn, token) => {
      const value = valueFn(data);
      str = str.replace(token, value);
    });
    // output = data.messages.slice(1);
    const output = data.messages;
    output.unshift(str);
    return output;
  } // formatLog()
  
  static output(data) {
    data.formattedTimestamp = Logger.formatDate(data.timestamp, dateFormatStr);
    
    // snapshot the messages
    //
    // we're sure we're going to log at this point, so do that work
    // 
    data.messages = Logger.snapshot(data.messages);
    
    const output = Logger.formatLog(data, formatStr);
    
    Logger.lastOutputTimestamp = data.timestamp;
    
    let fn;
    switch (data.level) {
      case 'trace':
      case 'debug':
        fn = console.log;
        break;
        
      case 'info': 
        fn = console.info || console.log;
        break;
      
      case 'warn':
        fn = console.warn || console.log;
        break;
        
      case 'error':
        fn = console.error || console.log;
        break;
    }
    
    fn.apply(console, output);
  } // output
  
  // instance methods
  // ================
  
  constructor({
    
    format = "(%D) %L:  [%N]",
    dateFormat = "YYYY-MM-DD HH:mm:ss.SSS",
  }) {
    this.format = format;
    this.dateFormat = dateFormat;
  } // constructor
  
  /**
  * adds a spec to the end of the specs array (least priority).
  * returns the spec.
  */
  pushSpec(spec: LevelSpec | SpecProps): LevelSpec {
    if (!spec instanceof LevelSpec) {
      spec = new LevelSpec(spec);
    }
    
    this.specs.push(spec);
    
    return spec;
  }
  
  /**
  * adds a spec to the beginning of the specs (highest priority).
  * returns the spec.
  */
  unshiftSpec(spec: LevelSpec | SpecProps): LevelSpec {
    if (!spec instanceof LevelSpec) {
      spec = new LevelSpec(spec);
    }
    
    this.spec.unshift(spec);
    
    return spec;
  }
  
  /**
  * 
  */
  notify(...messages) {
    if (notifier) {
      notifier.notify({
        title: this.name,
        message: _.map(messages, inspect),
      });
    }
    this.info(...messages);
  }
  
  /**
  * find the active level spec given spec query properties from a log message, 
  * which is the first spec for which `LevelSpec#match` returns true.
  * 
  * - query: SpecQuery
  * 
  * 
  * returns `undefined` if no spec matches.
  */
  specFor(query: SpecQuery): ?LevelSpec {
    return _.find(this.specs, (spec: LevelSpec) => spec.match(query));
  }
  
  /**
  * 
  */
  levelFor(query: SpecQuery): ?Level {
    const spec: ?LevelSpec = specFor(query);
    
    if (spec) {
      return spec.level;
    }
    
    return; // undefined
  }
  
  /**
  * determines if a message should be logged given level and spec query info
  * by finding the applicable level spec and seeing if it's level is 
  */
  shouldLog(level: Level, query : SpecQuery): boolean {
    const currentLevel: ?Level = this.levelFor(query);
    
    if (!currentLevel) {
      // we don't have any matching level spec so log everything
      return true;
    }
    
    return level.rank <= currentLevel.rank;
  }
  
  /**
  * log a message unless filtered by a level spec.
  */
  log(message: MetalogMessage): boolean {
    const level: Level = Level.forName(levelName);
    const query: SpecQuery = _.pick(
      message,
      ['filename', 'parentPath', 'content']
    );
    
    // bail now if there is a spec filtering out this message
    if (!this.shouldLog(level, query)) {
      return false;
    }
    
    const timestamp: Date = new Date();
    
    // now we know we're going to output
    const logMessage: LogMessage = {
      ...message,
      timestamp,
      formattedTimestamp: this.formatDate(timestamp),
      delta: this.getDelta(timestamp),
      
    }
    
  } // log
  
  getLevelString(level: Level): string {
    return _.padEnd(
      level.name.toUpperCase(),
      LEVEL_NAME_PAD_LENGTH
    );
  }
  
  /**
  * header for messages in the node server environment where the timestamps
  * are useful since the logs persist.
  * 
  *     DEBUG 2016-09-13 17:41:01.234 (+8783ms) [/imports/api/blah.js:f:88]
  */
  getNodeHeader() {
    return [
      this.getLevelString(level),
      this.formatDate(date),
      `(${ this.getDelta(date) })`,
      `[${ this.getPath({filename, parentPath, line}) }]`,
    ].join(' ');
  }
  
  /**
  * header for messages in the browser environment where the timestamps
  * are pretty pointless since we don't save the logs.
  * 
  *     DEBUG (+8783ms) [/imports/api/blah.js:f:88]
  */
  getBrowserHeader() {
    return [
      this.getLevelString(level),
      `(${ this.getDelta(date) })`,
      `[${ this.getPath({filename, parentPath, line}) }]`,
    ].join(' ');
  }
  
  /**
  * log the message in the node environment, where we don't need to fuck with
  * values vs. references like we do on the browser since it get spits out
  * text. we also have colors there.
  * 
  * gonna try out the `print` npm package for display.
  * 
  * https://www.npmjs.com/package/print
  */
  logInNode(): void {
    
  }
  
} // class Logger

