import chai, { expect } from 'chai';
import _ from 'lodash';
import { itMaps2 } from '../../../lib/testing.js';
import * as nrser from '../../../lib/index.js';
import t from 'tcomb';

describe('types/number.js', () => {
  describe('type Integer', () => {
    expect( nrser.t.Integer.is(1) ).to.be.true;
    expect( nrser.t.Integer.is(3.14) ).to.be.false;
    
    expect(() => { 
      const i: nrser.t.Integer = 3.14;
      return i;
    }).to.throw(TypeError, /Invalid value 3\.14 supplied/);
    
  }); // Integer
  
  describe("type ZERO", () => {
    itMaps2({
      func: v => nrser.t.ZERO.is(v),
      map: (f, throws) => [
        f(0), true,
        f(1), false,
        f(0.0), true,
        f(-1), false,
        f(0.1), false,
      ],
    });
    
    expect(() => {
      const z: nrser.t.ZERO = 1;
    }).to.throw(TypeError, /Invalid value 1 supplied/);
  });
  
  describe("type Positive", () => {
    itMaps2({
      func: v => nrser.t.Positive.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), true,
        f(0.1), true,
        f(-1), false,
      ],
    });
    
    expect(() => {
      const z: nrser.t.Positive = -1;
    }).to.throw(TypeError, /Invalid value -1 supplied/);
  });
  
  describe("type PositiveInteger", () => {
    itMaps2({
      func: v => nrser.t.PositiveInteger.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), true,
        f(0.1), false,
        f(-1), false,
      ],
    });
    
    expect(() => {
      const z: nrser.t.PositiveInteger = 1.1;
    }).to.throw(TypeError, /Invalid value 1\.1 supplied/);
  });
  
  describe("type Negative", () => {
    itMaps2({
      func: v => nrser.t.Negative.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), false,
        f(-0.1), true,
        f(-1), true,
      ],
    });
    
    expect(() => {
      const z: nrser.t.Negative = 0;
    }).to.throw(TypeError, /Invalid value 0 supplied/);
  });
  
  describe("type NegativeInteger", () => {
    itMaps2({
      func: v => nrser.t.NegativeInteger.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), false,
        f(-0.1), false,
        f(-1), true,
      ],
    });
    
    expect(() => {
      const z: nrser.t.NegativeInteger = -1.1;
    }).to.throw(TypeError, /Invalid value -1\.1 supplied/);
  });
  
  describe("type NonPositiveInteger", () => {
    itMaps2({
      func: v => nrser.t.NonPositiveInteger.is(v),
      map: (f, throws) => [
        f(0), true,
        f(1), false,
        f(-0.1), false,
        f(-1), true,
      ],
    });
  });
  
  describe("type NonNegativeInteger", () => {
    itMaps2({
      func: v => nrser.t.NonNegativeInteger.is(v),
      map: (f, throws) => [
        f(0), true,
        f(1), true,
        f(0.1), false,
        f(-1), false,
      ],
    });
  });
  
});
