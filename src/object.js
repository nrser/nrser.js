// @flow

import _ from 'lodash';
import t from 'tcomb';

import { j, squish } from './string.js';
import { Undefined, Empty, ReifiedKeyPath, KeyPath } from './types.js';
import { MergeConflictError, KeyError } from './errors';

function groupEach(behavior) {
  return (obj, iteratee, context) => {
    const result = {};
    _.each(obj, (value, index) => {
      const keys = iteratee.call(context, value, index, obj);
      _.each(keys, (key) => {
        behavior(result, value, key);
      });
    });
    return result;
  }
} // groupEach()

export const groupByEach = groupEach((result, value, key) => {
  if (_.has(result, key)) {
    result[key].push(value);
  } else {
    result[key] = [value];
  }
}); // groupByEach()

/**
* merges `objects` together from left right throwing `MergeConflictError` if
* any keys are duplicated among them.
*/
export function mergeNoConflicts(...objects: Array<Object>) {
  // Objects(objects);
  
  const result = {};
  
  _.each(objects, (object) => {
    _.each(object, (value, key) => {
      if (_.has(result, key)) {
        throw new MergeConflictError(
          j`merge conflict for key ${ key }`,
          {objects}
        );
      }
      
      result[key] = value;
    });
  });
  
  return result;
} // mergeNoConflicts

/**
* gets the value at a key path from an object 
*
* @param {Object} object
*   the object to fetch from.
* 
* @param 
*/
export function fetch(
  object: Object,
  path: KeyPath,
  {defaultValue} = {}
): * {
  KeyPath(path);
  
  const result = do {
    if (_.isEmpty(path)) {
      object
    } else {
      _.get(object, path)
    }
  }
  
  if (_.isUndefined(result)) {
    if (_.isUndefined(defaultValue)) {
      throw new KeyError(`key not found`, {object, path});
    } else {
      return defaultValue;
    }
  }
  
  return result;
}