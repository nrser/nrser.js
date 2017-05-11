// @flow

import _ from '//src/lodash';
import t from 'tcomb';

import { j, squish } from './string.js';
import { KeyError } from './errors';

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
* Set `keyPath` to `value` in `object` only if the key does not exist. The key
* path must be completely absent -- if it is set to `undefined` or `null` 
* an error will still be thrown.
* 
* **Mutates `object`.**
* 
* @param {Object} object
*   Object to insert into.
* 
* @param {KeyPath} keyPath
*   Key path to insert at.
* 
* @param {*} value
*   Value to insert.
* 
* @return {Object}
*   The mutated object.
* 
* @throws {KeyError}
*   If `keyPath` exists in `object`.
*/
export function insert(object: Object, keyPath: KeyPath, value: any): Object {
  if (_.has(object, keyPath)) {
    throw KeyError.squish(`Key path ${ keyPath } exists in object.`, {
      keyPath,
      currentValue: _.get(object, keyPath),
      object
    });
  }
  
  return _.set(object, keyPath, value);
}


/**
* Shallow merges `objects` together into a new {@link Object} as long as there
* are no conflicting keys.
* 
* @param {...Object} objects
*   Objects to merge.
* 
* @return {Object}
*   New object assembled from `objects`.
* 
* @throws {KeyError}
*   If any of `objects` share keys.
*/
export function assemble(...objects: Array<Object>): Object {
  // Objects(objects);
  
  const result = {};
  
  _.each(objects, (object) => {
    _.each(object, (value, key) => {
      if (_.has(result, key)) {
        throw new KeyError(
          j`merge conflict for key ${ key }`,
          {objects}
        );
      }
      
      result[key] = value;
    });
  });
  
  return result;
} // assemble()


/**
* gets the value at a key path from an object, throwing `KeyError`
* if the result is `undefined`.
*
* @param {Object} object
*   the object to retrieve from.
* 
* @param {?KeyPath} keyPath
*   the path to the key.
* 
* @param {Object} options
* @property {*} defaultValue
*   Value to default to if `keyPath` is not found.
* 
* @return {*}
*   The value at `keyPath`.
*/
export function need(
  object: Object,
  keyPath?: KeyPath,
  {
    defaultValue,
    errorMsg,
  }: {
    defaultValue?: mixed,
    errorMsg: string | Function,
  } = {}
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

_.mixin({
  insert,
  need,
  assemble,
  mapDefinedValues,
});
