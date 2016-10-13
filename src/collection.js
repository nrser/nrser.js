// @flow

// deps
import _ from 'lodash';

// package
import * as errors from './errors';

// types
import type { Collection }  from './types/collection';

/**
* extra stuff that would be along the lines of lodash collections functions
*/

/**
* find the only match, throwing if anything except one result.
*/
export function findOnly<V>(
  collection: Collection<V>,
  predicate: (value: V) => boolean,
): V {
  const results: Array<V> = _.filter(collection, predicate);
  
  if (results.length == 0) {
    throw new errors.NotFoundError(`no results`);
  } else if (results.length > 1) {
    throw new errors.NrserError(`multiple results`, results);
  }
  
  return results[0];
}
