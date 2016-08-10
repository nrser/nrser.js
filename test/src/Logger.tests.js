import chai from 'chai';
import { Logger } from '../../lib/Logger.js';

describe('Logger.js', () => {
  describe('Logger', () => {
    describe('.setLevel()', () => {
      it("throws on bad args", () => {
        chai.expect(() => Logger.setLevel({})).to.throw(TypeError);
        chai.expect(() => Logger.setLevel({level: 'blah'})).to.throw(TypeError);
      });
      
      it("works on good args", () => {
        chai.expect(Logger.setLevel({level: 'info'})).to.be.undefined;
      });
    });
    
    describe('.setLevels()', () => {
      it("throws on bad args", () => {
        // chai.expect(() => Logger.setLevels()).to.throw(TypeError);
        chai.expect(() => Logger.setLevel({blah: 'blue'})).to.throw(TypeError);
      });
      
      it("works with good args", () => {
        chai.expect(
          Logger.setLevels({
            "beiarea:dropbox-store:DropboxReadThrough": 'info'
          })
        ).to.be.undefined;
      });
    });
  });
  
  describe('Logger.snapshot()', () => {
    
    it("handles circular references", () => {
      const obj = {};
      obj.obj = obj;
      
      chai.expect(
        Logger.snapshot(obj)
      ).to.eql({obj: obj});
    });
    
  }); // describe example()
});