// @flow

// package
import fs from '../../fs';

// ugh
import { Pattern } from '../util';
import { Task } from './Task';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName, DoneCallback } from '../types';

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
    super({ugh, id, name: `clean:${ id }`});
    
    this.dest = dest;
  }
  
  run(onDone?: DoneCallback): void {
    this.pipeline(this.dest, onDone);
  }
  
  runOne(dest: string, onDone?: DoneCallback): void {
    this.pipeline(dest, onDone);
  }
  
  /**
  * run the clean pipeline (which is just a `git clean` command).
  */
  pipeline(
    dest: string,
    onDone: ?DoneCallback
  ): void {
    // for `git clean` to work the way we want it - removing all files from
    // a directory that are ignored by git - even if that directory has
    // checked-in files in it, we want it to end with a slash
    fs.isDir(dest, (null_: null, isDir: boolean): void => {
      if (isDir && !dest.endsWith('/')) {
        dest += '/';
      }
      
      let relDest = this.relative(dest);

      const cmd = `git clean -fdX ${ relDest }`;
      
      const details = {dest, relDest, cmd};

      this.log("pipelining clean", details);

      exec(cmd, {cwd: this.ugh.packageDir}, (error, stdout, stderr) => {
        if (error) {
          this.logError(error, {details});
          
          // let caller know there was a problem if needed
          if (onDone) {
            onDone(error);
          }
          
        } else {
          // log any outputs
          _.each({stdout, stderr}, (output, name) => {
            if (output) {
              this.log(`${ name }: \n${ output }`);
            }
          });
          
          // notify the user
          this.notify('CLEANED', this.relative(dest));
          
          // let caller know we're done here if needed
          if (onDone) {
            onDone();
          }
        }
      }); // exec
    }); // fs.isDir
  } // # pipeline
}