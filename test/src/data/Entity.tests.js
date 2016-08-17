import chai, { expect } from 'chai';
import { itMaps2 } from '../../../lib/testing.js';
import * as nrser from '../../../lib';
import t from 'tcomb';
import _ from 'lodash';

describe("data/Entity.js", () => {
  describe("Entity", () => {
    context("basic inheritance and type checking", () => {
      class Base extends nrser.d.Entity {
        static meta = nrser.d.Entity.extendMeta({
          props: {
            x: t.String,
          },
        });
      }
      
      context("Base class", () => {
        it("creates an instance with a valid value", () => {
          expect(new Base({x: "ex"})).not.to.throw;
        });
        
        it("fails to create an instance with invalid values", () => {
          _.each([{}, {x: 1}], (values) => {
            expect(() => new Base(values)).to.throw(TypeError);
          });
        });
        
        it("creates an accessor for the value", () => {
          expect(new Base({x: 'ex'}).x).to.equal('ex');
        });
        
        it("prevents setting the value", () => {
          const base = new Base({x: 'ex'});
          expect(() => base.x = 'hey!').to.throw(TypeError);
        });
        
        it("creates Entity instances", () => {
          expect(new Base({x: 'ex'}) instanceof nrser.d.Entity).to.be.true;
        });
        
        it("creates Base instances", () => {
          expect(new Base({x: 'ex'}) instanceof Base).to.be.true;
        });
        
        it("is a tcomb type", () => {
          expect(t.isType(Base)).to.be.true;
        });
        
        it("creates instances that pass Entity.is()", () => {
          expect(nrser.d.Entity.is(new Base({x: 'ex'}))).to.be.true;
        });
        
        it("creates instances that pass Base.is()", () => {
          expect(Base.is(new Base({x: 'ex'}))).to.be.true;
        });
      }); // Base class
      
      class Sub extends Base {
        static meta = Base.extendMeta({
          props: {
            y: t.String,
          },
        });
      }
      
      context("Sub class", () => {
        const defaultValues = {x: 'ex', y: 'why'};
        
        const defaultSub = function() {
          return new Sub(defaultValues);
        };
        
        it("creates an instance with a valid value", () => {
          expect(new Sub({x: "ex", y: 'why'})).not.to.throw;
        });

        it("fails to create an instance with invalid values", () => {
          _.each([{}, {x: 'ex'}, {y: 'why'}, {x: 'ex', y: 1}], (values) => {
            expect(() => new Sub(values)).to.throw(TypeError);
          });
        });

        it("creates an accessors for the values", () => {
          const sub = defaultSub();
          expect(sub.x).to.equal(defaultValues.x);
          expect(sub.y).to.equal(defaultValues.y);
        });

        it("creates Entity instances", () => {
          expect(defaultSub() instanceof nrser.d.Entity).to.be.true;
        });

        it("creates Base instances", () => {
          expect(defaultSub() instanceof Base).to.be.true;
        });
        
        it("creates Sub instances", () => {
          expect(defaultSub() instanceof Sub).to.be.true;
        });

        it("is a tcomb type", () => {
          expect(t.isType(Sub)).to.be.true;
        });

        it("creates instances that pass Entity.is()", () => {
          expect(nrser.d.Entity.is(defaultSub())).to.be.true;
        });

        it("creates instances that pass Base.is()", () => {
          expect(Base.is(defaultSub())).to.be.true;
        });
        
        it("creates instances that pass Sub.is()", () => {
          expect(Sub.is(defaultSub())).to.be.true;
        });
      
      }); // Sub class
    }); // basic inheritance and type checking
  }); // Entity
}); // data/Entity.js