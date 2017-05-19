import _ from '//src/nodash';
import t from 'tcomb';
import { j } from './string.js';

import * as errors from './errors';

export function match(value, ...clauses) {
  for (let i = 0, len = clauses.length; i < len; i += 2) {
    const pattern = clauses[i];
    const output = clauses[i + 1];
    
    // console.log({pattern, output});

    if (
      (t.isType(pattern) && pattern.is(value)) ||
      (typeof pattern === 'function' && value instanceof pattern) ||
      value === pattern
    ) {
      if (_.isFunction(output)) {
        return output(value);
      } else {
        return output;
      }
    }
  }
  
  let message = j`value ${ value } failed to match `;
  for (let i = 0, len = clauses.length; i < len; i += 2) {
    const type = clauses[i];
    
    if (t.isType(type)) {
      message += t.getTypeName(type);
    } else {
      message += type;
    }
    
    if (i != len - 1) {
      message += ' | ';
    }
  }
  
  throw new errors.MatchError(message, {value});
};