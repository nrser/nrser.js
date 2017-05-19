/**
* file system stuff
* 
* extends fs-extra with other things i want / need
*/

import _ from '//src/nodash';
import fsExtra from 'fs-extra';
import Promise from 'bluebird';

type Stats = {
  isDirectory: () => boolean,
};

/**
* fsExtra, cloned and extended.
*/
export const fs = _.clone(fsExtra);

fs.statPromise = Promise.promisify(fs.stat);

/**
* async check if a path is a directory. accepts a callback that is fired 
* with `null` followed by `true` or `false` (never errors back).
*/
export function isDir(path: string): Promise<boolean> {
  return fs.statPromise(path)
    .then((stats: Stats) => {
      return stats.isDirectory();
    })
    .catch((error: Error) => {
      return false;
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


// /**
// *
// */
// var path       = require('path')
//   , fs         = require('fs')
//   , exists     = fs.exists || path.exists
//   , existsSync = fs.existsSync || path.existsSync
//   ;
// 
// function splitPath(path) {
//   var parts = path.split(/(\/|\\)/);
//   if (!parts.length) return parts;
// 
//   // when path starts with a slash, the first part is empty string
//   return !parts[0].length ? parts.slice(1) : parts;
// }
// 
// exports = module.exports = function (currentFullPath, clue, cb) {
// 
//   function testDir(parts) {
//     if (parts.length === 0) return cb(null, null);
// 
//     var p = parts.join('');
// 
//     exists(path.join(p, clue), function (itdoes) {
//       if (itdoes) return cb(null, p);
//       testDir(parts.slice(0, -1));
//     });
//   }
// 
//   testDir(splitPath(currentFullPath));
// }
// 
// exports.sync = function (currentFullPath, clue) {
// 
//   function testDir(parts) {
//     if (parts.length === 0) return null;
// 
//     var p = parts.join('');
// 
//     var itdoes = existsSync(path.join(p, clue));
//     return itdoes ? p : testDir(parts.slice(0, -1));
//   }
// 
//   return testDir(splitPath(currentFullPath));
// }

export default fs;
