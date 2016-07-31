/**
* extending meteor's check function to include the value that failed in
* the error and define some helper utils
*/

import { _ } from 'lodash';
import { CheckError } from './errors';
import { j } from './string.js';

// handle conditional import for meteor
// TODO check should be ported to run under node
let meteorCheck, MeteorMatch;

if (Meteor) {
  ({meteorCheck, MeteorMatch} = require('meteor/check'));
} else {
  // TODO stub out with no-ops and nulls for now
  
  const noop = function() {};
  
  MeteorMatch = {
    Maybe: noop,
    Where() {
      return function() {};
    },
    Integer: null,
    test: noop,
  };
  
  meteorCheck = noop;
}

export const Match = {};

_.extend(Match, MeteorMatch);

export function check(value, pattern) {
  try {
    meteorCheck(value, pattern);
  } catch (meteorCheckError) {
    const checkError = new CheckError(
      meteorCheckError.message +
      j` (value=${ value }, pattern=${ pattern })`
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
