import chai, { expect } from 'chai';
import _ from 'lodash';
import { itMaps } from '//lib/testing';
import * as nrser from '//lib/index.js';
import t from 'tcomb';
import Promise from 'bluebird';

describe('types/index.js', () => {
  describe('nonEmptyList()', () => {
    itMaps({
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
  
  describe('ErrorType', function () {
    expect(nrser.t.ErrorType.is(new Error('hey'))).to.be.true;
  });

  describe('PromiseType', function () {
    expect(nrser.t.PromiseType.is(new Promise(() => {}))).to.be.true;
  });
});
