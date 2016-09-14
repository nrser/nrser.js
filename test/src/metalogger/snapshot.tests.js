import chai, {expect} from 'chai';
import _ from 'lodash';
import { itMaps2 } from '../../../lib/testing.js';
import { snapshot, SNAPSHOT_REF } from '../../../lib/metalogger/snapshot';

describe('metalogger/snapshot.js', () => {
  describe('snapshot', () => {
    it("does a basic clone", () => {
      const obj = {hey: 'ho'};
      const objSnap = snapshot(obj);
      expect(objSnap === obj).to.be.false;
      expect(objSnap).to.eql(obj);
    });
    
    it("wraps stuff it can't clone in SNAPSHOT_REF", () => {
      const e = new Error('hey there');
      const eSnap = snapshot(e);
      expect(eSnap instanceof SNAPSHOT_REF).to.be.true;
      expect(eSnap.value).to.eql(e);
    });
    
    it("works at depth", () => {
      const e = new Error('hey there');
      const obj = {a: {b: {e}}, c: 'see!'};
      const objSnap = snapshot(obj);
      expect(objSnap === obj).to.be.false;
      expect(objSnap.a === obj.a).to.be.false;
      expect(objSnap.c).to.eql(obj.c);
      expect(objSnap.a.b.e instanceof SNAPSHOT_REF).to.be.true;
      expect(objSnap.a.b.e.value === e).to.be.true;
    });
  });
});