// @flow


// Imports
// ==========================================================================

import StdlibPath from 'path';
import _ from '//src/lodash';
import _untildify from 'untildify';


// Types
// ==========================================================================

import type { $Refinement, $Reify } from 'tcomb';

// types
//======

/**
* An absolute path.
* 
* @typedef {string} AbsPath
*/
export type AbsPath = string & $Refinement<typeof StdlibPath.isAbsolute>;

/**
* tcomb type for {@link AbsPath}.
*
* @type {Type}
*/
export const tAbsPath = (({}: any): $Reify<AbsPath>);


/**
* tests if the string is a path segment, which is a string that devoid of the
* path separator and not empty.
*/
export function isPathSegment(str: string): boolean {
  return str !== '' && str.indexOf(StdlibPath.sep) === -1;
}

export type PathSegement = string & $Refinement<typeof isPathSegment>;

export type PathSegments = Array<PathSegement>;


// Exports
// ==========================================================================

// re-export everything from stdlib path
export * from 'path';

// export the untildify function
export const untildify = _untildify;

/**
* split a path by the system separator, removing any empty parts.
*/
export function split(path: string): PathSegments {
  return _.reject(path.split(StdlibPath.sep), (part: string) => {
    return part === '';
  });  
}

/**
* gets and absolute path by un-tilde-fying (expand '~') and then resolving.
*/
export function absolute(path: string): AbsPath {
  return StdlibPath.resolve(untildify(path));
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
    return StdlibPath.join('/', ...common);
  }
}