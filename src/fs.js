// @flow

/**
* file system stuff
* 
* extends fs-extra with other things i want / need
*/

// Imports
// ==========================================================================

// Deps
import FsExtra from 'fs-extra';
import Promise from 'bluebird';

// Package
import _ from '//src/nodash';


// Types
// ==========================================================================

import type { $Refinement, $Reify } from 'tcomb';

import type { NodeCallback } from '//src/function';
import { tNodeCallback } from '//src/function';

export type Stat = {
  isDirectory: () => boolean,
};

export const tStat = (({}: any): $Reify<Stat>);


// Exports
// ==========================================================================

/**
* fsExtra, cloned and extended.
*/
export const FS = _.clone(FsExtra);

/**
* async check if a path is a directory. accepts a callback that is fired 
* with `null` followed by `true` or `false` (never errors back).
*/
export function isDir(
  path: string,
  callback: ?NodeCallback,
): Promise<boolean> {
  if (callback) {
    FS.stat(path, (err: ?Error, stat: ?Stat): void => {
      if (err) {
        callback(null, false);
      } else {
        callback(null, stat.isDirectory());
      }
    });
    
  } else {
    return FS.stat(path)
      .then((stat: Stat) => {
        return stat.isDirectory();
      })
      .catch((error: Error) => {
        return false;
      });
    
  }
} // isDir()
FS.isDir = isDir;

/**
* sync version of isDir.
*/
export function isDirSync(path: string): boolean {
  try {
    const stat: Stat = FS.statSync(path);
    return stat.isDirectory();
  } catch(error) {
    return false;
  }
}
FS.isDirSync = isDirSync;

export default FS;
