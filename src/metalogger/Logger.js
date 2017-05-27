/**
* new logger for use with babel-plugin-metalog
* 
* adapted from nrser.Logger, which was adapted from pince
* 
* https://github.com/mad-eye/pince
* 
*/

import t from 'tcomb';
import minimatch from 'minimatch';
import chalk from 'chalk';

import _ from '//src/nodash';
import { IS_NODE, IS_BROWSER } from '//src/env';
import print from '//src/print';
import { squish, indent } from '//src/string';
import match from '//src/match';

import type { NonNegativeInteger } from '../types/number';

import { Level, LEVEL_NAME_PAD_LENGTH, tLevelName } from './Level';
import type { LevelName } from './Level';

import { LevelSpec } from './LevelSpec';

import type { SpecQuery, SpecProps } from './LevelSpec';
import { snapshot } from './snapshot';

// optional requires that may or may not be present

let notifier;
try {
  notifier = require('node-notifier');
} catch (e) {}

// types
// =====

type RefsLabel =  "errorRefs" |
                  "warnRefs" | 
                  "infoRefs" | 
                  "debugRefs" | 
                  "traceRefs";

// type NotifLabel = 

/**
* raw message that the METALOG plugin generates as the argument to `METALOG()`
* (or whatever global function call is configured).
* 
* this is basically just what i found in babel-plugin-trace with a few
* small changes.
*/
type MetalogMessage = {
  label: string, // LevelName,
  filename: string,
  filepath: string,
  content: Array<*>,
  line: number,
  parentPath: Array<string>,
  binding: ?Object,
};

/**
* message we craft in the runtime out of the MetalogMessage with properties
* we need to actually output.
* 
* @typedef {Object} LogMessage
* 
* @property {Level} level
*   Log level.
*/
type LogMessage = {
  // level of the message
  level: Level,
  
  // if we should log refs (as `console.log` and friends normally do) instead
  // of trying to snapshot the values
  refs: boolean,
  
  // if we should try to generate a system notification in addition to logging
  // the message
  notif: boolean,
  
  // datetime of the log call
  date: Date,
  
  // the path to the log site that we output,
  // which is <filename>:<parentPath>:<line>
  path: string,
  
  // ms since last message logged
  delta: ?number,
  
  // the content from the MetalogMessage
  content: Array<*>,
  
  // context returned from calling `logContext` on `binding` if it exists.
  context: *,
};

// TODO fill out
type LoggerConfig = {};


function dump(value: *): string {
  return (typeof value === 'string') ? value : print(value);
}


export class HeaderFormatter {
  constructor(message) {
    this.message = message;
  }
  
  get level() {
    return _.padEnd(
      this.message.level.name.toUpperCase(),
      LEVEL_NAME_PAD_LENGTH
    );
  }
  
  get path() {
    return this.message.path;
  }
  
  get date() {
    return this.message.date.toISOString();
  }
  
  get delta(): string {
    const delta = this.message.delta;
    
    let digits = '----';
    
    if (typeof delta !== 'undefined') {
      if (delta > 9999) {
        digits = '++++';
        
      } else {
        digits = _.padStart(this.message.delta, 4, '0');
        
      }
    }
    
    return `+${ digits }ms`;
  }
  
  get path(): string {
    return this.message.path;
  }
  
  get hasContext(): boolean {
    return !!this.message.context;
  }
  
  get context(): string {
    return dump(this.message.context);
  }
  
  indent(str: string): string {
    return indent(str);
  }
} // HeaderFormatter


export class Logger {
  // Static Properties
  // =====================================================================
  
  static defaultConfig = {
    baseLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    
    formatter: HeaderFormatter,
    
    logContextName: '__logContext',
    
    header: {
      cli: '<%= date %> (<%= delta %>) <%= level %> [<%= path %>]<% if (hasContext) { %>\n<%= indent(context) %><% } %>',
      browser: '(<%= delta %>) <%= level %> [<%= path %>]<% if (hasContext) { %>\n<%= indent(context) %><% } %>',
    },
    
    notif: {
      cli: {
        title: '<%= level %>',
        preamble: '[<%= path %>]<% if (hasContext) { %>\n<%= indent(context) %><% } %>',
      },
    },
    
    colors: {
      cli: {
        error: 'bold.red',
        warn: 'bold.yellow',
        info: 'bold.cyan',
        debug: 'bold.blue',
        trace: 'bold.gray',
      },
      
      browser: {
        error: '#CC0C39', //'#d8292f',
        warn: '#E6781E', // '#d39100',
        info: '#1693A7', // '#337ab7',
        debug: '#00548b',
        trace: '#a3aaae',
      },
    },
  }; // .defaultConfig
  
  
  // Static Methods
  // =====================================================================
  
  /**
  * formats the path consisting of filename, parentPath and line for output.
  */
  static formatPath(rawMessage: MetalogMessage): string {
    const path = [rawMessage.filename, rawMessage.line];
    
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
    
    return path.join(':');
  }
  
  
  // Instance Properties
  // =====================================================================
  
  /**
  * @private
  * 
  * Level to log at if none of {@link Logger#levelSpecs} match a message.
  * 
  * @type {Level}
  */
  _baseLevel: Level;
  
  lastMessageDate: ?Date;
  
  specs: Array<LevelSpec>;
  
  config: LoggerConfig;
  
  /**
  * @private
  * 
  * Internal pause state. DON'T TOUCH!
  * 
  * @type {boolean}
  */
  _isPaused: boolean;
  
  /**
  * @private
  * 
  * Internal list of paused messages. DON'T TOUCH!
  * 
  * @type {Array<LogMessage>}
  */
  _pausedMessages: Array<LogMessage>;
  
  
  // Construction
  // =====================================================================
  
  constructor(config = {}) {
    this._isPaused = false;
    this._pausedMessages = [];
    this.specs = [];
    
    this.config = _.merge({}, this.constructor.defaultConfig, config);
    
    this.baseLevel = this.config.baseLevel;
    
    // compile header templates
    this.headerTemplates = _.mapValues(this.config.header, _.template);
    
    // cache compiled templates
    // TODO needs to be cleaned out if config changes
    this._templateCache = {};
    
    if (config.levelSpecs) {
      _.each(config.levelSpecs, (spec) => this.pushSpec(spec));
    }
  } // constructor
  
  
  
  // Instance Getters and Setters
  // =====================================================================
  
  get baseLevel(): Level {
    return this._baseLevel;
  }
  
  set baseLevel(level: Level | LevelName): void {
    this._baseLevel = match(level,
      Level, level,
      tLevelName, name => Level.forName(name),
    )
  }
  
  
  // Instance Methods
  // =====================================================================
  
  // Utilities
  // ---------------------------------------------------------------------
  
  /**
  * Gets the ms since the last message was logged, or undefined if it's the
  * first. Updates {@link Logger#lastMessageDate} to `now`.
  * 
  * @param {Date} now
  *   Time of current message.
  * 
  * @return {?NonNegativeInteger}
  *   Milliseconds since last message, or `undefined` if there isn't one.
  */
  getDelta(now: Date): ?NonNegativeInteger {
    if (this.lastMessageDate) {
      return now - this.lastMessageDate;
    }
  }
  
  
  /**
  * Render a lodash template in the config at a key path, caching the 
  * templates.
  * 
  * @param {string} keyPath
  *   Path to template in config, like `'header.cli'`.
  * 
  * @param {LogMessage} message
  *   Message to render against.
  * 
  * @return {string}
  *   Rendered string.
  */
  render(keyPath: string, message: LogMessage) {
    if (!this._templateCache[keyPath]) {
      this._templateCache[keyPath] = _.template(
        _.get(this.config, keyPath)
      );
    }
    
    return this._templateCache[keyPath](new this.config.formatter(message));
  }
  
  
  // Spec and Level Instance Methods
  // ---------------------------------------------------------------------
  
  /**
  * adds a spec to the end of the specs array (least priority).
  * returns the spec.
  */
  pushSpec(spec: LevelSpec | SpecProps): LevelSpec {
    if (!(spec instanceof LevelSpec)) {
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
    if (!(spec instanceof LevelSpec)) {
      spec = new LevelSpec(spec);
    }
    
    this.spec.unshift(spec);
    
    return spec;
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
      // we don't have any matching level spec so compare to baseLevel
      return level.rank <= this.baseLevel.rank;
    }
    
    return level.rank <= currentLevel.rank;
  }
  
  
  // Raw Metalog Message Handler
  // ---------------------------------------------------------------------
  
  /**
  * log a message unless filtered by a level spec.
  */
  log(rawMessage: MetalogMessage): boolean {
    let refs: boolean = false;
    let notif: boolean = false;
    let levelName: string = rawMessage.label;
    
    // plain 'notif' label is logged as 'info' level
    if (levelName === 'notif') {
      notif = true;
      levelName = 'info';
    }
    
    if (_.includes(levelName, 'Refs')) {
      refs = true;
      levelName = levelName.replace('Refs', '');
    }
    
    if (_.includes(levelName, 'Notif')) {
      notif = true;
      levelName = levelName.replace('Notif', '');
    }
    
    const path: string = this.constructor.formatPath(rawMessage);
    
    const level: Level = Level.forName(levelName);
    const query: SpecQuery = {
      content: rawMessage.content,
      path,
    };
    
    // bail now if there is a spec filtering out this message
    if (!this.shouldLog(level, query)) {
      return false;
    }
    
    const now: Date = new Date();
    const delta: ?NonNegativeInteger = this.getDelta(now);
    // set the last message date so `#getDelta` will work
    // do it here so an error outputting won't break `#getDelta`
    this.lastMessageDate = now;
    
    let context;
    
    if (
      rawMessage.binding &&
      typeof rawMessage.binding[this.config.logContextName] == 'function'
    ) {
      context = rawMessage.binding[this.config.logContextName]();
    }
    
    // now we know we're going to output
    // form the log message
    const logMessage: LogMessage = {
      level,
      refs,
      notif,
      date: now,
      path,
      delta,
      content: rawMessage.content,
      context,
    };
    
    if (this._isPaused) {
      this._pausedMessages.push(logMessage);
      return false;
    }
    
    // do environment-dependent output
    if (IS_NODE) {
      this.logInCLI(logMessage);
    } else if (IS_BROWSER) {
      this.logInBrowser(logMessage);
    } else {
      throw new Error("don't seem to be in node or the browser, can't log");
    }
    
    // signal that we output the log
    return true;
  } // #log()
  
  
  
  // Pause and Play
  // ---------------------------------------------------------------------
  
  /**
  * `true` if the logger is paused, `false` otherwise.
  * 
  * @type {boolean}
  */
  isPaused(): boolean {
    return this._isPaused;
  }
  
  
  /**
  * Test if there are any paused messages queued.
  * 
  * @return {boolean}
  *   True if there are any pused messages.
  */
  hasPausedMessages(): boolean {
    return this._pausedMessages.length > 0;
  }
  
  
  /**
  * Stop writing messages until {@link Logger#play} is called.
  * 
  * @param {?(function(): <T>)} block
  *   Block to execute while paused, then call {@link Logger#play} and return
  *   result.
  * 
  * @return {?<T>}
  *   Result of calling `block` if provided, else `undefined`.
  */
  pause<T>(block: void | () => T): ?T {
    this._isPaused = true;
    
    if (block) {
      const result: T = block();
      this.play();
      return result;
    }
  } // #pause()
  
  
  /**
  * Un-pause the logger and write any messages that were queued while it was
  * paused.
  * 
  * @return {undefined}
  */
  play(): void {
    this._isPaused = false;
    
    if (!_.isEmpty(this._pausedMessages)) {
      let logFunc;
      
      // do environment-dependent output
      if (IS_NODE) {
        logFunc = this.logInCLI.bind(this);
      } else if (IS_BROWSER) {
        logFunc = this.logInBrowser.bind(this);
      } else {
        throw new Error("don't seem to be in node or the browser, can't log");
      }
      
      for (let i = 0, l = this._pausedMessages.length; i < l; i++) {
        logFunc(this._pausedMessages[i]);
      }
    }
    
    this._pausedMessages = [];
  } // #play()
  
  
  // CLI Instance Methods
  // ---------------------------------------------------------------------
  
  /**
  * sends a system notification if the node-notifier package is available.
  */
  notifyInCLI(message: LogMessage) {
    if (notifier) {
      const title = this.render('notif.cli.title', message);
      
      const preamble = this.render('notif.cli.preamble', message);
      
      notifier.notify({
        title,
        message: preamble + "\n" + _.map(message.content, dump).join("\n"),
      });
    }
  } // #notifyInCLI()
  
  /**
  * Color a string for Node CLI output (if we have a color for it's level).
  * 
  * @TODO Result could be cached relative to {@link Logger#config}.
  * 
  * @param {string} configKey
  *   Key in `this.config.colors.cli` that has the path to the `chalk`
  *   method to do the coloring.
  * 
  * @param {string} input
  *   The string to color.
  * 
  * @return {string}
  *   The string with color added (if we found a color for it).
  */
  colorForCLI(configKey: string, input: string): string {
    const chalkKeyPath = _.get(this.config, ['colors', 'cli', configKey]);
    
    if (!chalkKeyPath) {
      return input;
    }
    
    const chalker = _.get(chalk, chalkKeyPath);
    
    if (typeof chalker === 'function') {
      return chalker(input);
    }
    
    return input;
  } // #colorForCLI
  
  
  /**
  * Format a message into an array of strings for the CLI. Broken out to make
  * testing easier without having to hook `console.log` or IO.
  * 
  * @param {LogMessage} message
  *   Message to log.
  * 
  * @return {Array<string>}
  *   Strings to log. First one is header.
  */
  formatForCli(message: LogMessage): Array<string> {
    const formatted: Array<string> = [
      this.colorForCLI(
        message.level.name,
        this.render('header.cli', message),
      )
    ];
    
    for (let i = 0, l = message.content.length; i < l; i++) {
      formatted.push(dump(message.content[i]));
    }
    
    return formatted;
  } // #formatForCli()
  
  
  /**
  * Log the message to Node CLI, where we don't need to fuck with
  * values vs. references like we do on the browser since it get spits out
  * text at that time. we also have colors there (easily).
  * 
  * Uses our es6-ification of the [print][] package to dump non-strings.
  * 
  * [print]: https://www.npmjs.com/package/print
  * 
  * @param {LogMessage} message
  *   Message to log.
  * 
  * @return {undefined}
  */
  logInCLI(message: LogMessage): void {
    // trying to be reasonably efficient here
    
    const formatted = this.formatForCli(message);
    
    // header, don't indent
    console.log(formatted[0]);
    
    // dumps, indent
    for (let i = 1, l = formatted.length; i < l; i++) {
      console.log(indent(formatted[i]));
    }
    
    // send a notif if needed
    if (message.notif) {
      this.notifyInCLI(message);
    }
  } // #logInCLI()
  
  
  // Browser Instance Methods
  // ---------------------------------------------------------------------
  
  /**
  * Format a message into an array of strings for the browser. Broken out to 
  * make testing easier without having to hook `console.log`.
  * 
  * @param {LogMessage} message
  *   Message to log.
  * 
  * @return {Array<string>}
  *   Strings to log. First one is header.
  */
  formatForBrowser(message: LogMessage): Array<string> {
    const formatted: Array<string> = [];
    
    const header: string = this.render('header.browser', message);
    
    const color = _.get(
      this.config,
      ['colors', 'browser', message.level.name]
    );
    
    if (color) {
      formatted.push(`%c ${ header }`);
      formatted.push(`color: ${ color };`);
    } else {
      formatted.push(header);
    }
    
    // snapshot content if needed
    const content = (
      message.refs ? message.content : snapshot(message.content)
    );
    
    for (let i = 0, l = content.length; i < l; i++) {
      formatted.push(content[i]);
    }
    
    return formatted;
  } // #formatForBrowser()
  
  
  /**
  * Log the message in the browser, where we want to log the actual
  * objects so we can explore them in the console, but usually want to log
  * snapshots of the values as they were at the times they were logged.
  * 
  * @param {LogMessage} message
  *   Message to log.
  * 
  * @return {undefined}
  */
  logInBrowser(message: LogMessage): void {
    console.log(...this.formatForBrowser(message));
  } // #logInBrowser()
  
} // class Logger

export default Logger;