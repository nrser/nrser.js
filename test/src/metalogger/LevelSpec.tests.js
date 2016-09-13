import chai, { expect } from 'chai';
import _ from 'lodash';
import { itMaps, itMaps2 } from '../../../lib/testing.js';
import { LevelSpec } from '../../../lib/metalogger/LevelSpec';
import { Level } from '../../../lib/metalogger/Level';

describe('metalogger/LevelSpec.js', () => {
  describe('LevelSpec', () => {
    
    describe("file spec", () => {      
      it("matches extact filename", () => {
        const spec = new LevelSpec({
          file: "/imports/api/index.js",
          level: "error"
        });
        
        expect(spec.level).to.be.equal(Level.ERROR);
        
        expect(spec.matchFile("/imports/api/index.js")).to.be.true;
        expect(spec.matchFile("/imports/blah/blow.me")).to.be.false;
        
        expect(spec.match({
          filename: "/imports/api/index.js",
          parentPath: [],
          content: [],
        })).to.be.true;
      });
      
      it("matches with globs", () => {
        const spec = new LevelSpec({
          file: "/imports/api/**/*",
          level: "warn"
        });
        
        expect(spec.level).to.be.equal(Level.WARN);
        
        expect(spec.matchFile("/imports/api/index.js")).to.be.true;
        expect(spec.matchFile("/imports/api/x/y/z.ee")).to.be.true;
        expect(spec.matchFile("/imports/ui/whatever.js")).to.be.false;
      });
    }); // file spec
    
    describe("path spec", () => {
      it("matches exactly", () => {
        const spec = new LevelSpec({
          level: "info",
          path: "a:b:c",
        });
        
        expect(spec.level).to.be.equal(Level.INFO);
        
        expect(spec.matchPath(['a', 'b', 'c'])).to.be.true;
      });
    }); // path spec
  }); // LevelSpec
});