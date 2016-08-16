import chai from 'chai';
import _ from 'lodash';
import { itMaps, itMaps2 } from '../../../lib/testing.js';
import * as nrser from '../../../lib/index.js';
import t from 'tcomb';
import Promise from 'promise';

describe('types/index.js', () => {
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