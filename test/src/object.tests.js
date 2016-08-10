import chai from 'chai';
import { itMaps2 } from '../../lib/testing.js';
import { mergeNoConflicts, need } from '../../lib/object.js';
import { MergeConflictError, KeyError } from '../../lib/errors/';

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
  
  describe("need", () => {
    itMaps2({
      func: need,
      
      map: (f, throws) => ([
        f({x: 1}, []),                            {x: 1},
        f({x: 1}, ['x']),                         1,
        f({x: [{y: 'why'}]}, ['x', 0, 'y']),      'why',
        f({x: [{y: 'why'}]}, 'x.0.y'),            'why',
        f({}, 'a'),                               throws(KeyError),
        f({}, 'a', {defaultValue: 'blah'}),       'blah',
      ]),
    })
  });
});