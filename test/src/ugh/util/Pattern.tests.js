import chai, { expect } from 'chai';
import { itMaps } from '../../../../lib/testing.js';
import { Pattern } from '../../../../lib/ugh/util/Pattern';
import path from 'path';

describe('ugh/util/Pattern.js', () => {
  describe('Pattern', () => {
    describe('.fromPath', () => {
      const p = path.resolve('src/**/*.js');
      let pattern;
      
      beforeEach(() => {
        pattern = Pattern.fromPath(p);
      });
      
      it('has correct base property', () => {
        expect(pattern)
          .to.have.property('base')
          .that.is.equal(path.resolve('src'));
      });
      
      it('has correct pattern property', () => {
        expect(pattern)
          .to.have.property('pattern')
          .that.is.equal('**/*.js');
      });
      
      it("recombines to correct path", () => {
        expect(pattern)
          .to.have.property('path')
          .that.is.equal(p);
      })
    }); // .fromPath
    
    describe('#match', () => {
      itMaps({
        func: (patternStr: string, filepath: string): boolean => {
          return Pattern.fromPath(
            path.resolve(patternStr)
          ).match(path.resolve(filepath));
        },
        
        map: (f, throws) => [
          f('src/**/*.js', 'src/index.js'), true,
          f('src/**/*.js', 'src/index.jsx'), false,
          f('src/**/*.js', 'src/server/index.js'), true,
        ]
      })
    }); // #match
  }); // Pattern
}); // ugh/util/Pattern.js