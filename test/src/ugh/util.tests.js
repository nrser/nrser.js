import chai, { expect } from 'chai';
import { itMaps2 } from '../../../lib/testing.js';
import { hasGlobPatterns, Src } from '../../../lib/ugh/util';
import path from 'path';

describe('ugh/util', () => {
  describe('Src', () => {
    it('defaults base properly', () => {
      const src = new Src(path.resolve('src/**/*.js'));
      expect(src.base).to.equal(path.resolve('src'));
    });
  });
  
  describe('hasGlobPatterns()', () => {
    itMaps2({
      func: hasGlobPatterns,
      map: (f, throws) => [
        f(''), false,
        f('src'), false,
        f('src/index.js'), false,
        f('src/**/*.js'), true,
        f(), throws(TypeError),
      ]
    })
  });
})