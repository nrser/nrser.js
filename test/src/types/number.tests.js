import chai, { expect } from 'chai';
import _ from 'lodash';
import { itMaps } from '//lib/testing';
import * as NRSER from '//lib/index.js';
import t from 'tcomb';

describe('types/number.js', () => {
  describe('type Integer', () => {
    itMaps({
      func: v => NRSER.t.Integer.is(v),
      funcName: 'Integer.is',
      map: (f, throws) => [
        f(1), true,
        f(3.14), false,
      ]
    });
    
    itMaps({
      func: v => NRSER.t.Integer(v),
      funcName: 'Integer',
      map: (f, throws) => [
        f(1), 1,
        f(3.14), throws(TypeError, /Invalid value 3\.14 supplied/),  
      ]
    });
  }); // Integer
  
  describe("type Zero", () => {
    itMaps({
      func: v => NRSER.t.Zero.is(v),
      map: (f, throws) => [
        f(0), true,
        f(1), false,
        f(0.0), true,
        f(-1), false,
        f(0.1), false,
        f(-0), true,
      ],
    });
    
    // expect(() => {
    //   const z: NRSER.t.Zero = 1;
    // }).to.throw(TypeError, /Invalid value 1 supplied/);
  });
  
  describe("type Positive", () => {
    itMaps({
      func: v => NRSER.t.Positive.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), true,
        f(0.1), true,
        f(-1), false,
      ],
    });
    
    // expect(() => {
    //   const z: NRSER.t.Positive = -1;
    // }).to.throw(TypeError, /Invalid value -1 supplied/);
  });
  
  describe("type PositiveInteger", () => {
    itMaps({
      func: v => NRSER.t.PositiveInteger.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), true,
        f(0.1), false,
        f(-1), false,
      ],
    });
    
    // expect(() => {
    //   const z: NRSER.t.PositiveInteger = 1.1;
    // }).to.throw(TypeError, /Invalid value 1\.1 supplied/);
  });
  
  describe("type Negative", () => {
    itMaps({
      func: v => NRSER.t.Negative.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), false,
        f(-0.1), true,
        f(-1), true,
      ],
    });
    
    // expect(() => {
    //   const z: NRSER.t.Negative = 0;
    // }).to.throw(TypeError, /Invalid value 0 supplied/);
  });
  
  describe("type NegativeInteger", () => {
    itMaps({
      func: v => NRSER.t.NegativeInteger.is(v),
      map: (f, throws) => [
        f(0), false,
        f(1), false,
        f(-0.1), false,
        f(-1), true,
      ],
    });
    
    // expect(() => {
    //   const z: NRSER.t.NegativeInteger = -1.1;
    // }).to.throw(TypeError, /Invalid value -1\.1 supplied/);
  });
  
  describe("type NonPositiveInteger", () => {
    itMaps({
      func: v => NRSER.t.NonPositiveInteger.is(v),
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
      func: v => NRSER.t.NonNegativeInteger.is(v),
      map: (f, throws) => [
        f(0), true,
        f(1), true,
        f(0.1), false,
        f(-1), false,
      ],
    });
  });
  
});
