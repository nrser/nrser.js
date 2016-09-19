import minimatch from 'minimatch';
import _ from 'lodash';

import { Level } from './Level';
import type { LevelName } from './Level';

export type SpecQuery = {
  path: string,
  content: Array<*>,
};

export type SpecProps = {
  level: LevelName,
  path?: string,
  content?: string,
};

export class LevelSpec {
  level: Level;
  path: ?string;
  pathPattern: ?string;
  content: ?RegExp;
  _cache: Object;
  
  static minimatchize(s: string): string {
    return s.replace(/\:/g, '/');
  }
  
  constructor(props: SpecProps) {
    this.level = Level.forName(props.level);
    
    if (props.path) {
      this.path = props.path;
      this.pathPattern = this.constructor.minimatchize(props.path)
    }
    
    if (props.content) {
      this.content = new RegExp(props.content);
    }
    
    this._cache = {};
  }
  
  cache(key, getter) {
    if (!_.has(this._cache, key)) {
      this._cache[key] = getter();
    }
    return this._cache[key];
  }
  
  match(query: SpecQuery): boolean {
    return _.every([
      this.matchPath(query.path),
      this.matchContent(query.content),
    ]);
  }
  
  matchPath(path: string): boolean {
    // there is no path info so it always matches
    if (!this.pathPattern) {
      return true;
    }
    
    return this.cache(`path=${ path }`, () => {
      return minimatch(this.constructor.minimatchize(path), this.pathPattern);
    });
  }
  
  matchContent(content: Array<*>): boolean {
    // there is no content info so it always matches
    if (!this.content) {
      return true;
    }
    
    // otherwise join all the strings in the message content array and
    // see if the content RegExp matches
    
    return !!_.filter(content, _.isString).join(' ').match(this.content);
  }
}