// @flow

// system
import { exec } from 'child_process';

// deps
import _ from 'lodash';
import Promise from 'bluebird';

// package
import fs from '../../fs';

// ugh
import { Pattern } from '../util';
import { Task } from './Task';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName } from '../types';

/**
* little struct that hold info about a babel task that's been created.
* 
* needed because other tasks may need access to info about where babel
* sources and destinations are.
*/
export class CleanTask extends Task {
  dest: string;
  
  constructor({ugh, id, dest}: {
    ugh: Ugh,
    id: TaskId,
    dest: string,
  }) {
    super({ugh, id});
    
    this.dest = dest;
  }
  
  /**
  * run the clean pipeline (which is just a `git clean` command).
  */
  execute(dest: string = this.dest): Promise<void> {
    // for `git clean` to work the way we want it - removing all files from
    // a directory that are ignored by git - even if that directory has
    // checked-in files in it, we want it to end with a slash
    
    const details = {dest};
    
    return fs.isDir(dest)
      
      .then((isDir) => {
        if (isDir && !dest.endsWith('/')) {
          dest += '/';
        }
          
        let relDest = this.ugh.relative(dest);

        const cmd = `git clean -fdX ${ relDest }`;
        
        const details = {dest, relDest, cmd};

        this.log("executing clean", details);

        return Promise.promisify(exec)(cmd, {cwd: this.ugh.packageDir})
          .then((stdout, stderr) => {
            // log any outputs
            _.each({stdout, stderr}, (output, name) => {
              if (output) {
                this.log(`${ name }: \n${ output }`);
              }
            });
            
            // notify the user
            this.notify('CLEANED', this.ugh.relative(dest));
          });
      })
      
      .catch((error: Error) => {
        this.logError(error, {details});
        throw error;
      });
  } // # pipeline
}