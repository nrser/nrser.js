import chai, { expect } from 'chai';
import { _ } from 'nrser';
import { itMaps } from '//lib/testing';
import * as nrser from '//lib/index.js';
import t from 'tcomb';

describe('types/index.js', () => {
  describe('nonEmptyList()', () => {
    itMaps({
      func: (type, value) => nrser.t.nonEmptyList(type)(value),
      
      formatArgs: ([itemType, value]) => (
        `nonEmptyList<${ itemType.meta.name }>(${ JSON.stringify(value) })`
      ),
      
      map: (f, throws) => ([
        f(t.String, ['a', 'b', 'c']),   ['a', 'b', 'c'],
        f(t.String, []),                throws(TypeError),
      ]),
      
    });
  }); // describe nonEmptyList()
});
