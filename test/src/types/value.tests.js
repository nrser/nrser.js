import chai from 'chai';
import _ from 'lodash';
import { itMaps, itMaps2 } from '../../../lib/testing.js';
import * as nrser from '../../../lib/index.js';
import t from 'tcomb';

describe('types/value.js', () => {
  describe('value()', () => {
    chai.expect(nrser.t.value(1).is(1)).to.be.true;
  });

  describe('values', () => {
    const BLAH = nrser.t.values.of(['X', 'Y', 'Z']);

    it("has key values as properties", () => {
      chai.expect(BLAH.X).to.equal('X');
    });

    describe("type checking value properties", () => {
      itMaps2({
        func: v => BLAH.is(v),

        map: (f, throws) => [
          BLAH.X, true,
          BLAH.Y, true,
          'X', true,
          'A', false
        ]
      });

      chai.expect(BLAH.is(BLAH.X)).to.be.true;
    });

    describe("Value type properties for the values", () => {
      itMaps2({
        func: value => BLAH.types.X.is(value),

        map: (f, throws) => [
          BLAH.X, true,
          BLAH.Y, false
        ]
      });
    });

    itMaps2({
      func: values => nrser.t.values(values),

      map: (f, throws) => [
        f(['x', 'y', 'z']), throws(TypeError)
      ]
    });
  });
});