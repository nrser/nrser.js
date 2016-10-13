import chai, { expect } from 'chai';
import _ from 'lodash';
import { itMaps } from '../../../lib/testing.js';
import * as nrser from '../../../lib/index.js';
import t from 'tcomb';

describe('types/number.js', () => {
  describe('type Integer', () => {
    itMaps({
      func: v => nrser.t.Integer.is(v),
      funcName: 'Integer.is',
      map: (f, throws) => [
        f(1), true,
        f(3.14), false,
      ]
    });
    
    itMaps({
      func: v => nrser.t.Integer(v),
      funcName: 'Integer',
      map: (f, throws) => [
        f(1), 1,
        f(3.14), throws(TypeError, /Invalid value 3\.14 supplied/),  
      ]
    });
  }); // Integer
  
  describe("type ZERO", () => {
    itMaps({
      func: v => nrser.t.ZERO.is(v),
      map: (f, throws) => [
        f(0), true,
        f(1), false,
        f(0.0), true,
        f(-1), false,
        f(0.1), false,
      ],
    });
    
    // expect(() => {
    //   const z: nrser.t.ZERO = 1;
    // }).to.throw(TypeError, /Invalid value 1 supplied/);
  });
  
  describe("type Positive", () => {
    itMaps({
      func: v => nrser.t.Positive.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), true,
        f(0.1), true,
        f(-1), false,
      ],
    });
    
    // expect(() => {
    //   const z: nrser.t.Positive = -1;
    // }).to.throw(TypeError, /Invalid value -1 supplied/);
  });
  
  describe("type PositiveInteger", () => {
    itMaps({
      func: v => nrser.t.PositiveInteger.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), true,
        f(0.1), false,
        f(-1), false,
      ],
    });
    
    // expect(() => {
    //   const z: nrser.t.PositiveInteger = 1.1;
    // }).to.throw(TypeError, /Invalid value 1\.1 supplied/);
  });
  
  describe("type Negative", () => {
    itMaps({
      func: v => nrser.t.Negative.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), false,
        f(-0.1), true,
        f(-1), true,
      ],
    });
    
    // expect(() => {
    //   const z: nrser.t.Negative = 0;
    // }).to.throw(TypeError, /Invalid value 0 supplied/);
  });
  
  describe("type NegativeInteger", () => {
    itMaps({
      func: v => nrser.t.NegativeInteger.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), false,
        f(-0.1), false,
        f(-1), true,
      ],
    });
    
    // expect(() => {
    //   const z: nrser.t.NegativeInteger = -1.1;
    // }).to.throw(TypeError, /Invalid value -1\.1 supplied/);
  });
  
  describe("type NonPositiveInteger", () => {
    itMaps({
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
    itMaps({
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
