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

import { IS_NODE, IS_BROWSER } from '../env';
import print from '../print';
import type { NonNegativeInteger } from '../types/number';

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

// types
// =====

/**
* raw message that the METALOG plugin generates as the argument to `METALOG()`
* (or whatever global function call is configured).
* 
* this is basically just what i found in babel-plugin-trace with a few
* small changes.
*/
type MetalogMessage = {
  values: boolean,
  level: LevelName,
  filename: string,
  filepath: string,
  content: Array<*>,
  line: number,
  parentPath: Array<string>,
  // notif: boolean,
};

/**
* message we craft in the runtime out of the MetalogMessage with properties
* we need to actually output.
*/
type LogMessage = {
  // level of the message
  level: Level,
  
  // level formatted for output
  formattedLevel: string,
  
  // datetime of the log call
  date: Date,
  
  // date formatted for output
  formattedDate: string,
  
  // the path to the log site that we output,
  // which is <filename>:<parentPath>:<line>
  path: string,
  
  // ms since last message logged
  delta: ?number,
  
  // delta formatted for output
  formattedDelta: string,
  
  // the content from the MetalogMessage
  content: Array<*>,
}

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

export class Logger {
  lastMessageDate: ?Date;
  specs: Array<LevelSpec>;
  nodeHeaderFormat: string;
  browserHeaderFormat: string;
  dateFormat: string;
  
  // constants
  // =========
  
  static HEADER_FORMAT_TOKENS = {
    '%date':  (message: LogMessage): string => message.formattedDate,
    // '%level': (message: LogMessage) => COLORS[message.level](data.level),
    '%level': (message: LogMessage): string => message.formattedLevel,
    '%delta': (message: LogMessage): string => message.formattedDelta,
    '%path':  (message: LogMessage): string => message.path,
  };
  
  /**
  * tokens in date format string are replaced with result of calling
  * the function with the date.
  */
  static DATE_FORMAT_TOKENS = {
    'YYYY': (d: Date): string => _.padStart(d.getFullYear(), 4, "0"),
    'MM':   (d: Date): string => _.padStart(d.getMonth() + 1, 2, "0"),
    'DD':   (d: Date): string => _.padStart(d.getDate(), 2, "0"),
    'HH':   (d: Date): string => _.padStart(d.getHours(), 2, "0"),
    'mm':   (d: Date): string => _.padStart(d.getMinutes(), 2, "0"),
    'ss':   (d: Date): string => _.padStart(d.getSeconds(), 2, "0"),
    'SSS':  (d: Date): string => _.padStart(d.getMilliseconds(), 3, "0"),
  };
  
  // static methods
  // ==============
  
  static format(
    data: *,
    formatStr: string,
    tokens: {[token: string]: Function},
  ): string {
    let result: string = formatStr;
    _.each(tokens, (formatter, token) => {
      if (_.includes(formatStr, token)) {
        result = result.replace(new RegExp(token, 'g'), formatter(data));
      }
    });
    return result;
  }
  
  /**
  * format a date according to a format string, see `.DATE_FORMAT_TOKENS` for
  * the available tokens.
  */
  static formatDate(date: Date, formatStr: string): string {
    return this.format(date, formatStr, this.DATE_FORMAT_TOKENS);
  }
  
  /**
  * format a header according to a format string, see `.HEADER_FORMAT_TOKENS`
  * for the available tokens.
  */
  static formatHeader(message: LogMessage, formatStr: string): string {
    return this.format(message, formatStr, this.HEADER_FORMAT_TOKENS);
  }
  
  /**
  * the string output of the level.
  */
  static formatLevel(level: Level): string {
    return _.padEnd(
      level.name.toUpperCase(),
      LEVEL_NAME_PAD_LENGTH
    );
  }
  
  /**
  * formats a delta in ms for output.
  * 
  * when:
  * 
  * -   delta is undefined (first message), returns "+----ms"
  * -   the delta is 9999 or less, returns something like "+0888ms"
  * -   the delta is over 9999, returns "+++++ms"
  */
  static formatDelta(delta: ?NonNegativeInteger): string {
    let digits = '----';
    
    if (typeof delta !== 'undefined') {
      if (delta > 9999) {
        digits = '++++';
        
      } else {
        digits = _.padStart(delta, 4, '0');
        
      }
    }
    
    return `+${ digits }ms`;
  }
  
  static formatPath(rawMessage: MetalogMessage): string {
    const path = [rawMessage.filename];
    
    if (!_.isEmpty(rawMessage.parentPath)) {
      path.push(
        _.map(rawMessage.parentPath, (segment: string) => {
          if (segment.match(/\[anonymous\@\d+\]/)) {
            return "?";
          }
          return segment;
        }).join(':')
      );
    }
    
    path.push(rawMessage.line);
    
    return path.join(':');
  }
  
  // ========
  
  constructor({
    nodeHeaderFormat = "%date (%delta) %level [%path]",
    browserHeaderFormat = "(%delta) %level [%path]",
    dateFormat = "YYYY-MM-DD HH:mm:ss.SSS",
  }: {
    nodeHeaderFormat: string,
    browserHeaderFormat: string,
    dateFormat: string,
  } = {}) {
    this.nodeHeaderFormat = nodeHeaderFormat;
    this.browserHeaderFormat = browserHeaderFormat;
    this.dateFormat = dateFormat;
    this.specs = [];
  } // constructor
  
  // instance methods
  // ================
  
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
  * get the level from the spec for a query, if any match.
  */
  levelFor(query: SpecQuery): ?Level {
    const spec: ?LevelSpec = this.specFor(query);
    
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
  log(rawMessage: MetalogMessage): boolean {
    const level: Level = Level.forName(rawMessage.level);
    const query: SpecQuery = _.pick(
      rawMessage,
      ['filename', 'parentPath', 'content']
    );
    
    // bail now if there is a spec filtering out this message
    if (!this.shouldLog(level, query)) {
      return false;
    }
    
    const now: Date = new Date();
    const delta: ?NonNegativeInteger = this.getDelta(now);
    // set the last message date so `#getDelta` will work
    // do it here so an error outputting won't break `#getDelta`
    this.lastMessageDate = now;
    
    // now we know we're going to output
    // form the log message
    const logMessage: LogMessage = {
      level,
      formattedLevel: this.constructor.formatLevel(level),
      date: now,
      formattedDate: this.constructor.formatDate(now, this.dateFormat),
      path: this.constructor.formatPath(rawMessage),
      delta,
      formattedDelta: this.constructor.formatDelta(delta),
      content: rawMessage.content,
    };
    
    // do environment-dependent output
    if (IS_NODE) {
      this.logInNode(logMessage);
    } else if (IS_BROWSER) {
      this.logInBrowser(logMessage);
    } else {
      throw new Error("don't seem to be in node or the browser, can't log");
    }
    
    // signal that we output the log
    return true;
  } // log
  
  /**
  * gets the ms since the last message was logged, or undefined if it's the
  * first.
  */
  getDelta(now: Date): ?NonNegativeInteger {
    if (this.lastMessageDate) {
      return now - this.lastMessageDate;
    }
  }
  
  /**
  * get the proper `console.*` function for the log level.
  */
  getConsoleFunction(level: Level): Function {
    let fn: Function;
    
    switch (level.name) {
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
      
      default:
        throw new TypeError(`bad level name?! ${ level.name }`);
    }
    
    return fn;
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
  logInNode(message: LogMessage): void {
    const header: string = this.constructor.formatHeader(
      message,
      this.nodeHeaderFormat
    );
    
    const dumps: Array<string> = _.map(message.content, print);
    
    this.getConsoleFunction(message.level).call(console, header, ...dumps);
  }
  
  logInBrowser(message: LogMessage): void {
    const header: string = this.constructor.formatHeader(
      message,
      this.browserHeaderFormat
    );
    
    this.getConsoleFunction(message.level).call(console, header, ...message.content)
  }
  
} // class Logger

