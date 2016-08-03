import chai from 'chai';
import _ from 'lodash';
import { itMaps, itMaps2 } from '../src/testing.js';
import * as nrser from '../src/index.js';
import t from 'tcomb';

describe('types.js', () => {
  describe('nonEmptyList()', () => {
    itMaps2({
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
