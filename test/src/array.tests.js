import chai, { expect } from 'chai';

import { itMaps } from '//lib/testing';
import { eachAsArray, mapAsArray } from '//lib/array.js';

describe('//src/array.js', () => {
  describe('mapAsArray()', () => {
    itMaps({
      func: mapAsArray,
      map: (f, throws) => [
        f(1,          x => x + 1), [2],
        f([1, 2, 3],  x => x + 1), [2, 3, 4],
      ]
    });
  }); // mapAsArray()
  
  describe('eachAsArray()', () => {
    itMaps({
      func: (arg) => {
        const results = [];
        eachAsArray(arg, (value, index) => {
          results.push([value, index]);
        });
        return results;
      },
      
      map: (f, throws) => [
        f('a'), [['a', 0]],
        f(['a', 'b', 'c']), [['a', 0], ['b', 1], ['c', 2]],
        f(), [],
      ]
    })
  }); // eachAsArray()
});