/**
* extending meteor's check function to include the value that failed in
* the error and define some helper utils
*/

import { _ } from 'meteor/underscore';
import { check as meteorCheck, Match as MeteorMatch } from 'meteor/check';
import { UtilError } from './errors';

import * as util from '.';

export const Match = {};

_.extend(Match, MeteorMatch);

/**
* the error *we* throw when a check fails
* ours has the value that failed attached.
*/
export class CheckError extends UtilError {}

export function check(value, pattern) {
  try {
    meteorCheck(value, pattern);
  } catch (meteorCheckError) {
    const checkError = new CheckError(
      meteorCheckError.message +
      util.j` (value=${ value }, pattern=${ pattern })`
    );
    
    throw checkError;
  }
}

export function match(value, ...patterns) {
  if (patterns.length == 0) {
    throw new CheckError("no patterns provided", {
      value,
      patterns: _.map(patterns, pattern => pattern[0]),
    });
  }
  
  let matched = false;
  let result;
  let i = 0;
  while (!matched && i < patterns.length) {
    check(patterns[i].length, 2);
    
    const [pattern, handler] = patterns[i];
    
    if (Match.test(value, pattern)) {
      matched = true;
      
      // allow passing a value instead of always warpping it in a function
      // 
      // NOTE if you want to return a function, you will of course have
      // to wrap it.
      // 
      if (_.isFunction(handler)) {
        result = handler(value);
      } else {
        result = handler;
      }
      
    }
    
    i++;
  }
  
  if (matched) {
    return result;
  }
  
  const error = new CheckError("no match found", {
    value,
    patterns: _.map(patterns, pattern => pattern[0]),
  });
  
  throw error;
}

Match.NotEmpty = Match.Where(function(value) {
  return !_.isEmpty(value);
});
Match.NotEmpty.name = 'NotEmpty';

Match.NonEmptyString = Match.Where(function(value) {
  return _.isString(value) && !_.isEmpty(value);
})
Match.NonEmptyString.name = "NonEmptyString";

Match.PositiveInteger = Match.Where(function(value) {
  return (Match.test(value, Match.Integer) && value > 0);
});
Match.PositiveInteger.name = "PositiveInteger";

Match.NonNegetiveInteger = Match.Where(function(value) {
  return (Match.test(value, Match.Integer) && value >= 0);
});
Match.NonNegetiveInteger.name = 'NonNegetiveInteger';

// check if a value is a sub-array
Match.subarrayOf = function(array) {
  check(array, Array);
  
  return Match.Where(function(value) {
    check(value, Array);
    
    return _.every(value, (item) => {
      return _.contains(array, item);
    });
  });
};
Match.subarrayOf.name = 'subarrayOf';
