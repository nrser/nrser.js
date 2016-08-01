import chai from 'chai';
import { mergeNoConflicts } from '../src/object.js';

describe('object.js', () => {
  describe('mergeNoConflicts()', () => {
    it("returns {} when args are empty", () => {
      chai.expect(mergeNoConflicts()).to.eql({});
    });
    
    it("throws on bad args", () => {
      chai.expect(() => mergeNoConflicts(1, 2, 3)).to.throw(TypeError);
    });
  });
});