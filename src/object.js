// @flow

import _ from 'lodash';
import t from 'tcomb';

import { j, squish } from './string.js';
import { Undefined, Empty, ReifiedKeyPath, KeyPath } from './types';
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
* gets the value at a key path from an object, throwing `KeyError`
* if the result is `undefined`.
*
* @param {Object} object
*   the object to retrieve from.
* 
* @param {KeyPath} keyPath
*   the path to the key.
* 
* @return the 
*/
export function need(
  object: Object,
  keyPath: KeyPath,
  {defaultValue} = {}
): * {
  const result = do {
    if (_.isEmpty(keyPath)) {
      object
    } else {
      _.get(object, keyPath)
    }
  }
  
  if (_.isUndefined(result)) {
    if (_.isUndefined(defaultValue)) {
      const keyStr = do {
        if (_.isString(keyPath)) {
          keyPath
        } else {
          keyPath.join('.')
        }
      }
      
      throw new KeyError(
        `key ${ keyStr } not found`,
        {object, keyPath}
      );
    } else {
      return defaultValue;
    }
  }
  
  return result;
}