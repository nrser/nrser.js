// @flow

import sysPath from 'path';
import _ from 'lodash';
import type { $Refinement } from 'tcomb';
import _untildify from 'untildify';

export * from 'path';

export const untildify = _untildify;

// types
//======

export type AbsPath = string & $Refinement<typeof sysPath.isAbsolute>;

/**
* tests if the string is a path segment, which is a string that devoid of the
* path separator and not empty.
*/
export function isPathSegment(str: string): boolean {
  return str !== '' && str.indexOf(sysPath.sep) === -1;
}

export type PathSegement = string & $Refinement<typeof isPathSegment>;

export type PathSegments = Array<PathSegement>;

// functions
// =========

/**
* split a path by the system separator, removing any empty parts.
*/
export function split(path: string): PathSegments {
  return _.reject(path.split(sysPath.sep), (part: string) => {
    return part === '';
  });  
}

/**
* gets and absolute path by un-tilde-fying (expand '~') and then resolving.
*/
export function absolute(path: string): AbsPath {
  return sysPath.resolve(untildify(path));
}

/**
* find the common base path.
*/
export function commonBase(...paths: Array<string>): ?AbsPath {
  const splits = _.map(paths, (path: string): PathSegments => {
    return split(absolute(path))
  });
  
  const common = _.reduce(
    splits,
    (common: PathSegments, segments: PathSegments): PathSegments => {
      // short ciruit if we already know we can't match anything more
      if (common.length === 0) {
        return common;
      }
      
      let i = 0;
      const max = Math.max(common.length, segments.length);
      
      while (common[i] === segments[i] && i < max) { i++; }
      
      // short-circuit copy if it matched the whole thing
      if (i === common.length) {
        return common;
      }
      
      return common.slice(0, i);
    }
  );
  
  if (common.length > 0) {
    return sysPath.join('/', ...common);
  }
}