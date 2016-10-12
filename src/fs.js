/**
* file system stuff
* 
* extends fs-extra with other things i want / need
*/

import _ from 'lodash';
import fsExtra from 'fs-extra';

type Stats = {
  isDirectory: () => boolean,
};

/**
* fsExtra, cloned and extended.
*/
export const fs = _.clone(fsExtra);

/**
* async check if a path is a directory. accepts a callback that is fired 
* with `null` followed by `true` or `false` (never errors back).
*/
export function isDir(path: string, callback: Function): void {
  fs.stat(path, (error: ?Error, stats: ?Stats) => {
    if (error) {
      callback(null, false);
    } else {
      callback(null, stats.isDirectory());
    }
  });
}
fs.isDir = isDir;

/**
* sync version of isDir.
*/
export function isDirSync(path: string): boolean {
  try {
    const stats: Stats = fs.statSync(path);
    return stats.isDirectory();
  } catch(error) {
    return false;
  }
}
fs.isDirSync = isDirSync;

export default fs;
