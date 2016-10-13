import chai, { expect } from 'chai';
import { itMaps2 } from '../../../../lib/testing.js';
import { hasGlobPattern } from '../../../../lib/ugh/util';

describe('ugh/util/index.js', () => {
  describe('hasGlobPattern()', () => {
    itMaps({
      func: hasGlobPattern,
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