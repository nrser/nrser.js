import { _ } from 'meteor/underscore';

import { j } from './index.js';
import { check } from './check.js';
import { MergeConflictError } from './errors.js';

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
export function mergeNoConflicts(...objects) {
  const result = {};
  _.each(objects, (object) => {
    check(object, Object);
    
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
