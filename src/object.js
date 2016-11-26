// @flow

import _ from 'lodash';
import t from 'tcomb';

import { j, squish } from './string.js';
import { MergeConflictError, KeyError } from './errors';

import type { KeyPath, Collection }  from './types/collection';

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
  keyPath?: KeyPath,
  {defaultValue}: {defaultValue?: mixed} = {}
): * {
  const result = _.isEmpty(keyPath) ? (
    object
  ) : (
    _.get(object, keyPath)
  );
  
  if (result === undefined) {
    if (defaultValue === undefined) {
      let keyPathStr: string;
      
      if (keyPath === undefined) {
        keyPathStr = 'undefined';
      } else if (Array.isArray(keyPath)) {
        keyPathStr = keyPath.join('.');
      } else {
        keyPathStr = keyPath;
      }
      
      throw new KeyError(
        `key ${ keyPathStr } not found`,
        {object, keyPath}
      );
    } else {
      return defaultValue;
    }
  }
  
  return result;
}

/**
* map values but drop keys where the mapped value is undefined.
*/
export function mapDefinedValues<DOMAIN, CODOMAIN>(
  obj: {[key: string]: DOMAIN},
  iteratee: (value: DOMAIN, key: string) => CODOMAIN
): {[key: string]: CODOMAIN} {
  const results: {[key: string]: CODOMAIN} = {};
  
  _.each(obj, (value: DOMAIN, key: string): void => {
    const result = iteratee(value, key);
    if (result !== undefined) {
      results[key] = result;
    }
  });
  
  return results;
}
