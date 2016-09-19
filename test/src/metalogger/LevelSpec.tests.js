import chai, { expect } from 'chai';
import _ from 'lodash';
import { itMaps, itMaps2 } from '../../../lib/testing.js';
import { LevelSpec } from '../../../lib/metalogger/LevelSpec';
import { Level } from '../../../lib/metalogger/Level';

describe('metalogger/LevelSpec.js', () => {
  describe('LevelSpec', () => {
    
    describe("path spec", () => {      
      it("matches exact filename", () => {
        const spec = new LevelSpec({
          path: "/imports/api/index.js:**",
          level: "error"
        });
        
        expect(spec.level).to.be.equal(Level.ERROR);
        
        expect(spec.matchPath("/imports/api/index.js:8")).to.be.true;
        expect(spec.matchPath("/imports/blah/blow.me:69")).to.be.false;
        
        expect(spec.match({
          path: "/imports/api/index.js:f:8",
          content: [],
        })).to.be.true;
      });
      
      it("matches with globs", () => {
        const spec = new LevelSpec({
          path: "/imports/api/**/*",
          level: "warn"
        });
        
        expect(spec.level).to.be.equal(Level.WARN);
        
        expect(spec.matchPath("/imports/api/index.js")).to.be.true;
        expect(spec.matchPath("/imports/api/x/y/z.ee")).to.be.true;
        expect(spec.matchPath("/imports/ui/whatever.js")).to.be.false;
      });
    }); // file spec
    
    describe("content spec", () => {
      const spec = new LevelSpec({
        level: "info",
        content: "^/imports/ui/posts/All.jsx:All",
      });
      
      expect(
        spec.matchContent(["/imports/ui/posts/All.jsx:All", "mounted."])
      ).to.be.true;
      
    }); // content spec
  }); // LevelSpec
});