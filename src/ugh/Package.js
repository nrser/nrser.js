// @flow

// package
import fs from '../fs';
import * as path from '../path';
import { need } from '../object';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  AbsDir,
  DoneCallback,
  PackageJSON,
} from './types';

/**
* represents a package that ugh builds.
* 
* most of this functionality used to be in the {Ugh} class, but was moved into
* here so the object hierarchy was more clear.
* 
* package instances store the configuration for that package and the tasks
* that can be run for it.
*/
export class Package {
  /**
  * the name of the package, including scope.
  */
  name: string;
  
  /**
  * absolute path to 
  */
  jsonPath: AbsPath;
  
  /**
  * the package's `package.json`
  */
  json: PackageJSON;
  
  /**
  * Task instances by name.
  */
  tasksByName: {[name: TaskName]: Task};
  
  /**
  * @param dir [AbsPath]
  *   absolute path to the package directory.
  *   
  *   this needs to be absolute because included packages can't resolve off
  *   the current working directory since the executable was invoked in the
  *   parent package.
  * 
  * 
  */
  constructor(
    dir: AbsPath,
    {
      jsExts = ['js', 'jsx', 'es', 'es6'],
      
      babelRelativeDest = '../lib',
    } : {
      jsExts?: Array<string>,
      
      babelRelativeDest?: string,
    } = {},
  ) {
    this.dir = AbsPath(path.normalize(dir));
    
    this.jsonPath = path.join(dir, 'package.json');
    
    this.json = fs.readJsonSync(this.jsonPath);
    
    this.name = need(this.json, 'name');
    
    this.tasksByName = {};
  } // constructor
}