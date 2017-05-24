import chai, { expect } from 'chai';
import { _ } from 'nrser';
import { itMaps } from '//lib/testing';
import * as NRSER from '//lib/index.js';
import t from 'tcomb';

import { tIPromise } from 'nrser/lib/types/promise';
import { Promise as Bluebird } from 'nrser';

describe('File types/promise.js', () => {
  describe('Type IPromise', () => {
    itMaps({
      func: v => tIPromise.is(v),
      funcName: 'tIPromise.is',
      map: (f, throws) => [
        // native Node Promise
        f(Promise.resolve()), true,
        f(Promise.reject(new Error('problem!'))), true,
        
        f(Bluebird.resolve()), true,
        f(Bluebird.reject(new Error('problem!'))), true,
        
        f(), false,
        f(null), false,
      ]
    });
  }); // IPromise
  
}); // File types/promise.js
