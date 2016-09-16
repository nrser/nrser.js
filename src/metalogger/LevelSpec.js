import minimatch from 'minimatch';
import _ from 'lodash';

import { Level } from './Level';
import type { LevelName } from './Level';

export type SpecQuery = {
  filename: string,
  parentPath: Array<string>,
  content: Array<*>,
};

export type SpecProps = {
  level: LevelName,
  file?: string,
  path?: string,
  content?: string,
};

export class LevelSpec {
  level: Level;
  file: ?string;
  path: ?string;
  content: ?RegExp;
  
  constructor(props: SpecProps) {
    this.level = Level.forName(props.level);
    this.file = props.file;
    this.path = props.path;
    
    if (props.content) {
      this.content = new RegExp(props.content);
    }
  }
  
  match(query: SpecQuery): boolean {
    return _.every([
      this.matchFile(query.filename),
      this.matchPath(query.parentPath),
      this.matchContent(query.content),
    ]);
  }
  
  matchFile(filename: string): boolean {
    // there is no file info so it always matches
    if (!this.file) {
      return true;
    }
    
    return minimatch(filename, this.file);
  }
  
  matchPath(parentPath: Array<string>): boolean {
    // there is no path info so it always matches
    if (!this.path) {
      return true;
    }
    
    // check exact match
    if (parentPath.join(':') === this.path) {
      return true;
    }
    
    // check 
    
    return false;
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