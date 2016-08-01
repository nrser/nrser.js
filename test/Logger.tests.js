import chai from 'chai';
import { Logger } from '../src/Logger.js';

describe('Logger.js', () => {
  describe('Logger', () => {
    describe('.setLevel()', () => {
      it("throws on bad args", () => {
        chai.expect(() => Logger.setLevel({})).to.throw(TypeError);
        chai.expect(() => Logger.setLevel({level: 'blah'})).to.throw(TypeError);
      });
    });
    
    describe('.setLevels()', () => {
      it("throws on bad args", () => {
        chai.expect(() => Logger.setLevels()).to.throw(TypeError);
        chai.expect(() => Logger.setLevel({blah: 'blue'})).to.throw(TypeError);
      });
    });
  });
});