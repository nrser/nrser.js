import chai, { expect } from 'chai';
import { itMaps2 } from '../../../lib/testing.js';
import * as nrser from '../../../lib';
import t from 'tcomb';
import _ from 'lodash';

describe("types/struct.js", () => {
  describe("struct()", () => {
    describe("strict empty struct", () => {
      const empty = nrser.t.struct({}, {strict: true});
      
      itMaps2({
        funcName: 'empty',
        
        func: (obj) => empty(obj),
        
        map: (f, throws) => [
          f({}),      {},
          f({x: 1}),  throws(TypeError),
        ],
      });
    });
    
    describe("strict simple struct", () => {
      const simple = nrser.t.struct({x: t.String}, {strict: true});
      
      itMaps2({
        funcName: 'simple',
        
        func: obj => simple(obj),
        
        map: (f, throws) => [
          f({x: 'ex'}),             {x: 'ex'},
          f({x: 1}),                throws(TypeError),
          f({x: 'ex', y: 'why'}),   throws(TypeError),
        ],
      });
    });
  }); // struct()
  
  describe("Struct#extend()", () => {
    
    context("extend via added property", () => {
      const superStruct = nrser.t.struct({x: t.String});
      const subStruct = superStruct.extend({y: t.String});
    }); // added
    
    context("extend via intersection", () => {
      const superStruct = nrser.t.struct({x: t.Number});
      
      const subStruct = superStruct.extend({
        x: nrser.t.Integer,
      });
      
      it("created an intersection type for x", () => {
        expect(subStruct.meta.props.x.meta.kind).to.equal('intersection');
      });
      
      context("obj = {x: 3.15}", () => {
        const obj = {x: 3.15};
        
        it("is accepted by super struct", () => {
          expect(superStruct(obj)).to.eql(obj);
        });
        
        it("is rejected by sub struct", () => {
          expect(() => subStruct(obj)).to.throw(TypeError);
        });
      })
      
      context("obj = {x: 3}", () => {
        const obj = {x: 3};
        
        it("is accepted by super struct", () => {
          expect(superStruct(obj)).to.eql(obj);
        });
        
        it("is accepted by sub struct", () => {
          expect(subStruct(obj)).to.eql(obj);
        });
      });
      
    }); // intersection
    
    context("extend via refinement", () => {
      const superStruct = nrser.t.struct({x: t.Number});
      
      const subStruct = superStruct.extend({
        x: number => number % 2 === 0,
      });
      
      it("created an intersection type for x", () => {
        expect(subStruct.meta.props.x.meta.kind).to.equal('subtype');
      });
      
      context("obj = {x: 1}", () => {
        const obj = {x: 1};
        
        it("is accepted by super struct", () => {
          expect(superStruct(obj)).to.eql(obj);
        });
        
        it("is rejected by sub struct", () => {
          expect(() => subStruct(obj)).to.throw(TypeError);
        });
      });
      
      context("obj = {x: 2}", () => {
        const obj = {x: 2};
        
        it("is accepted by super struct", () => {
          expect(superStruct(obj)).to.eql(obj);
        });
        
        it("is accepted by sub struct", () => {
          expect(subStruct(obj)).to.eql(obj);
        });
      });
    }); // refinement
    
    
    context("extend via value specification", () => {
      const superStruct = nrser.t.struct({
        x: t.String,
      });
      
      context("value is of super type", () => {
        const subStruct = superStruct.extend({x: "ex"});
        
        it("created a irreducible type for x", () => {
          expect(subStruct.meta.props.x.meta.kind).to.equal('irreducible');
        });
                
        it("accepts that exact value", () => {
          expect(subStruct({x: "ex"})).to.eql({x: "ex"});
        });
        
        it("rejects other values", () => {
          expect(() => subStruct({x: "why"})).to.throw(TypeError);
        });
        
      });
      
      context("value is not of super type", () => {
        it("fails to create sub-struct", () => {
          expect(() => superStruct.extend({x: 3})).to.throw(TypeError);
        })
      });
    }); // value
    
    context("extending a strict struct", () => {
      const superStruct = nrser.t.struct({
        x: t.String,
      }, {strict: true});
      
      it("is strict", () => {
        expect(superStruct.meta.strict).to.be.true;
      });
      
      it("fails to extend with additional props", () => {
        expect(() => superStruct.extend({y: t.String})).to.throw(TypeError);
      });
      
      it("fails to extend with a non-strict struct", () => {
        expect(() => superStruct.extend(
          {x: nrser.t.NonEmptyString},
          {strict: false},
        )).to.throw(TypeError);
      });
      
      context("extend with an intersection", () => {
        const subStruct = superStruct.extend({x: nrser.t.NonEmptyString});
        
        it("is strict", () => {
          expect(subStruct.meta.strict).to.be.true;
        });
        
        it("creates an intersection type", () => {
          expect(subStruct.meta.props.x.meta.kind).to.equal('intersection');
        });
        
        it("fails when the value doesn't satisfy both types", () => {
          expect(() => subStruct({x: ''})).to.throw(TypeError);
        });
        
        it("succeeds when the value satisfies both types", () => {
          expect(subStruct({x: 'hey'})).to.eql({x: 'hey'});
        });
      }); // intersection
      
    }); // strict 
    
  }); // Struct#extend()
  
}); // types/struct.js