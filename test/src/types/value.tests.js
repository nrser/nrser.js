import chai, {expect} from 'chai';
import { _ } from 'nrser';
import { itMaps } from '//lib/testing';
import * as nrser from '//lib/index.js';
import t from 'tcomb';

describe('types/value.js', () => {
  describe('value()', () => {
    expect(nrser.t.value(1).is(1)).to.be.true;
  });

  describe('values', () => {
    describe('values.of()', () => {
      
      describe('upper case keys', () => {
        const BLAH = nrser.t.values.of(['X', 'Y', 'Z']);

        it("has key values as properties", () => {
          expect(BLAH.X).to.equal('X');
        });

        describe("type checking value properties", () => {
          itMaps({
            func: v => BLAH.is(v),

            map: (f, throws) => [
              f(BLAH.X), true,
              f(BLAH.Y), true,
              f('X'), true,
              f('A'), false
            ]
          });

          expect(BLAH.is(BLAH.X)).to.be.true;
        });

        describe("Value type properties for the values", () => {
          itMaps({
            func: value => BLAH.types.X.is(value),

            map: (f, throws) => [
              f(BLAH.X), true,
              f(BLAH.Y), false
            ]
          });
        });
      });
      
      const OUTS = nrser.t.values.of(['stdout', 'stderr']);
      
      expect(OUTS.is('stdout')).to.be.true;
    });
    
    describe('values', () => {
      const BLAH = nrser.t.values({
        X: 1,
        Y: 2,
      });
      
      expect(BLAH.is(1)).to.be.true;
    });
  });
});