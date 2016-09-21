// @flow

import _ from 'lodash';
import t from 'tcomb';

import { j, squish } from './string.js';
import { Undefined, Empty } from './types';
import type { KeyPath } from './types';
import { MergeConflictError, KeyError } from './errors';

type Collection<V> = Array<V> | {[key: string]: V};

/**
* like lodash/underscore `groupBy` but the iteratee (called `getGroups` here)
* should return an array of string group names and the value will be added to
* **all** those groups in the result.
*/
export function groupByEach<V>(
  collection: Collection<V>,
  
  getGroups: (
    value: V,
    index: string | number,
    collection: Collection<V>,
  ) => Array<string>,
  
  context?: Object
): {[group: string]: Array<V>} {
  // 
  let result: {[group: string]: Array<V>} = {};
  
  _.each(collection, (value: V, index: string | number): void => {
    const groups: Array<string> = getGroups.call(
      context,
      value,
      index,
      collection
    );
    
    _.each(groups, (group: string) => {
      if (_.has(result, group)) {
        result[group].push(value);
      } else {
        result[group] = [value];
      }
    });
  });
  
  return result;
} // groupByEach()

/**
* merges `objects` together from left right throwing `MergeConflictError` if
* any keys are duplicated among them.
*/
export function mergeNoConflicts(...objects: Array<Object>): Object {
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
  {defaultValue}: {defaultValue?: mixed} = {}
): * {
  const result = _.isEmpty(keyPath) ? (
    object
  ) : (
    _.get(object, keyPath)
  );
  
  if (_.isUndefined(result)) {
    if (_.isUndefined(defaultValue)) {
      const keyStr = typeof keyPath === 'string' ? (
        keyPath
      ) : (
        keyPath.join('.')
      );
      
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