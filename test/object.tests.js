import chai from 'chai';
import { mergeNoConflicts } from '../src/object.js';
import { MergeConflictError } from '../src/errors/';

describe('object.js', () => {
  describe('mergeNoConflicts()', () => {
    it("returns {} when args are empty", () => {
      chai.expect(mergeNoConflicts()).to.eql({});
    });
    
    it("throws on bad args", () => {
      chai.expect(() => mergeNoConflicts(1, 2, 3)).to.throw(TypeError);
    });
    
    it("succeeds when there are no conflicts", () => {
      chai.expect(
        mergeNoConflicts({a: 1}, {b: 2}, {c: 3, d: 4})
      ).to.eql({a: 1, b: 2, c: 3, d: 4});
    });
    
    it("fails when there are conflicts", () => {
      chai.expect(() => {
        mergeNoConflicts({a: 1}, {a: 2})
      }).to.throw(MergeConflictError);
    });
  });
});