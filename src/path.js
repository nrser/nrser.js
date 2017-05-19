// @flow


// Imports
// ==========================================================================

import StdlibPath from 'path';
import _ from '//src/lodash';
import _untildify from 'untildify';
import _tildify from 'tildify';


// Types
// ==========================================================================

import type { $Refinement, $Reify } from 'tcomb';

import t from 'tcomb';


// Path Types
// --------------------------------------------------------------------------

// ### Normalized Path

/** @private */
function isNormalized(path: string): boolean {
  return (
    (
      path === '.'
    ) || (
      path === '/'
    ) || (
      path !== '' && _.every(
        path.split(StdlibPath.sep),
        (seg, index, segs) => {
          return (
            seg !== '..'
          ) && (
            seg !== '.'
          ) && (
            index === 0 || index === segs.length - 1  || seg !== ''
          );
        }
      )
    )
  );
}

/**
* A normalized path is a path that is either:
* 
* -   Exactly `.`.
* -   Has no `.`, `..` or empty segments.
* 
* Intended to represent the return type of [path.normalize][].
* 
* [path.normalize]: https://nodejs.org/api/path.html#path_path_normalize_path
* 
* @typedef {string} NormPath
*/
export type NormPath = string & $Refinement<typeof isNormalized>;

/**
* tcomb type for {@link NormPath}.
* 
* @type {Type}
*/
export const tNormPath = (({}: any): $Reify<NormPath>);


// ### Absolute Path

/**
* An absolute path, per Node's [path.isAbsolute][],
* which returns `false` for tilde paths (`~/...`).
* 
* [path.isAbsolute]: https://nodejs.org/api/path.html#path_path_isabsolute_path
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


// ### Resolved Path

/**
* A resolved path is a path that is absolute and normalized, as returned from
* Node's [path.resolve][].
* 
* [path.resolve]: https://nodejs.org/api/path.html#path_path_resolve_path
* 
* @typedef {string} ResolvedPath
*/
export type ResPath = AbsPath & NormPath;

/**
* tcomb type for {@link ResPath}.
* 
* @type {Type}
*/
export const tResPath = (({}: any): $Reify<ResPath>);


// ### Tilde Path

/** @private */
function isTildePath(path: string): boolean {
  return path[0] === '~';
}

/**
* A tilde path is a string that starts with '~', which we interpret like the
* shell to mean the current user's home directory.
* 
* @typedef {string} TildePath
*/
export type TildePath = string & $Refinement<typeof isTildePath>;

/**
* tcomb type for {@link TildePath}.
* 
* @type {Type}
*/
export const tTildePath = (({}: any): $Reify<TildePath>);


// ### Path Segment

/** @private */
function isPathSegment(str: string): boolean {
  return str.indexOf(StdlibPath.sep) === -1;
}

/**
* A piece of a path... which is a string that doesn't have the path 
* separator character in it.
* 
* @typedef {string} PathSegment
*/
export type PathSegment = string & $Refinement<typeof isPathSegment>;

/**
* tcomb type for {@link PathSegment}.
* 
* @type {Type}
*/
export const tPathSegment = (({}: any): $Reify<PathSegment>);

/**
* Many pieces of paths.
* 
* @typedef {Array<string>} PathSegments
*/
export type PathSegments = Array<PathSegment>;

/**
* tcomb type for {@link PathSegments}.
* 
* @type {Type}
*/
export const tPathSegments = (({}: any): $Reify<PathSegments>);


// Directory Types
// --------------------------------------------------------------------------

// ### Directory Path

/** @private */
function isDirStr(path: string): boolean {
  const last = _.last(split(path));
  
  return (
    last === ''
  ) || (
    last === '.'
  ) || (
    last === '..'
  );
} // isDirStr()

/**
* A path that we know is a directory because it's last segment
* is empty, `.` or `..`.
* 
* @typedef {string} Dir
*/
export type Dir = string & $Refinement<typeof isDirStr>;

/**
* tcomb type for {@link Dir}.
* 
* @type {Type}
*/
export const tDir = (({}: any): $Reify<Dir>);


// ### Normalized Directory Path

/**
* A normalized directory - a {@link Dir} that is also a {@link NormPath}.
* 
* @typedef {string} NormDir
*/
export type NormDir = Dir & NormPath;

/**
* tcomb type for {@link NormDir}.
* 
* @type {Type}
*/
export const tNormDir = (({}: any): $Reify<NormDir>);


// ### Absolute Directory Path

/**
* An absolute directory - a {@link Dir} that is also a {@link AbsPath}.
* 
* @typedef {string} AbsDir
*/
export type AbsDir = Dir & AbsPath;

/**
* tcomb type for {@link AbsDir}.
* 
* @type {Type}
*/
export const tAbsDir = (({}: any): $Reify<AbsDir>);


// ### Resolved Directory Path

/**
* An resolved directory - a {@link Dir} that is also a {@link ResPath}.
* 
* @typedef {string} ResDir
*/
export type ResDir = Dir & ResPath;

/**
* tcomb type for {@link ResDir}.
* 
* @type {Type}
*/
export const tResDir = (({}: any): $Reify<ResDir>);


// ### Tilde (~) Directory Path

/**
* A directory relative to the user's home via starting with `~` -
* a {@link Dir} that is also a {@link TildePath}.
* 
* @typedef {string} TildeDir
*/
export type TildeDir = Dir & TildePath;

/**
* tcomb type for {@link TildeDir}.
* 
* @type {Type}
*/
export const tTildeDir = (({}: any): $Reify<TildeDir>);


// Exports
// ==========================================================================

// re-export everything from stdlib path
export * from 'path';

// export the tildify and untildify functions
export const untildify = _untildify;
export const tildify = _tildify;


/**
* Split a path by the system path separator.
*/
export function split(path: string): PathSegments {
  return path.split(StdlibPath.sep);
}


/**
* Like {@link Path.resolve} but it expands tilde paths to the user's home
* directory.
* 
* @param {...string} paths
*   Paths to expand. Joins them from last backwards until am absolute path is
*   formed, otherwise assumes relative to {@link process.cwd}.
* 
* @return {ResPath}
*   Resolved (absolute) path.
*/
export function expand(...paths: Array<string>): ResPath {
  return StdlibPath.resolve(..._.map(paths, p => untildify(p)));
}

/**
* @deprecated Old name for {@link expand}.
*/
export const absolute = expand;


/**
* Find the common base path. Expands paths before comparison, and doesn't 
* consider '/' to be common because it is shared between *all* unix-y file
* paths, making it a bit pointless.
*/
export function commonBase(...paths: Array<string>): ?ResPath {
  const splits = _.map(paths, (path: string): PathSegments => {
    return split(expand(path))
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
  
  if (common.length > 1) {
    return StdlibPath.join('/', ...common);
  }
} // commonBase()


/**
* Make a path string into a {@link Dir} by appending `/` to it if needed.
* 
* @param {string} path
*   Path to convert.
* 
* @return {Dir}
*   Directory string.
*/
export function toDir(path: string): Dir {
  if (tDir.is(t.String(path))) {
    return path;
  }
  
  return tDir(path + '/');
} // .toDir()

/**
* Resolve paths and apply {@link toDir} to the results to get a {@link ResDir}.
* 
* **NOTICE** 
* 
* Unless you explicitly *don't* want tilde (`~/...`) expansion you probably
* want to use {@link expandDir}, which expands paths that start with `~` to
* the current user's home direcotry.
* 
* @param {...string} paths
*   Paths to resolve.
* 
* @return {ResDir}
*   Resolved directory path.
*/
export function resolveDir(...paths: Array<string>): ResDir {
  return tResDir(toDir(StdlibPath.resolve(...paths)));
}


/**
* Expand paths and apply {@link toDir} to the results to get a {@link ResDir}.
* 
* @param {...string} paths
*   Paths to expand.
* 
* @return {ResDir}
*   Expanded directory path.
*/
export function expandDir(...paths: Array<string>): ResDir {
  return tResDir(toDir(expand(...paths)));
}
