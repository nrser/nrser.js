import chai, { expect } from 'chai';
import { _ } from 'nrser';
import { itMaps } from '//lib/testing';
import * as nrser from '//lib/index.js';
import t from 'tcomb';

describe('types/string.js', () => {
  describe("type Char", () => {
    itMaps({
      func: v => nrser.t.Char.is(v),
      map: (f, throws) => [
        f(''), false,
        f(' '), true,
        f('abc'), false,
      ],
    });
    
    // expect(() => {
    //   const c: nrser.t.Char = 1;
    // }).to.throw(TypeError, /Invalid value 1 supplied/);
  }); // Char
  
  describe("type NonEmptyString", () => {
    itMaps({
      func: v => nrser.t.NonEmptyString.is(v),
      map: (f, throws) => [
        f(''), false,
        f(' '), true,
        f('abc'), true,
      ],
    });
    
    // expect(() => {
    //   const c: nrser.t.NonEmptyString = 1;
    // }).to.throw(TypeError, /Invalid value 1 supplied/);
  }); // NonEmptyString
  
  describe("type UpperCaseString", () => {
    itMaps({
      func: v => nrser.t.UpperCaseString.is(v),
      map: (f, throws) => [
        f(''), true,
        f('ABC'), true,
        f('abc'), false,
        f('aBc'), false,
      ],
    });
    
    // expect(() => {
    //   const c: nrser.t.UpperCaseString = 1;
    // }).to.throw(TypeError, /Invalid value 1 supplied/);
  }); // NonEmptyString
});
