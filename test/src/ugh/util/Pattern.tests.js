import chai, { expect } from 'chai';
import { itMaps2 } from '../../../../lib/testing.js';
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
    });
  });
})