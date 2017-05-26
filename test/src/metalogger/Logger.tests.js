import chai, {expect} from 'chai';
import { _ } from 'nrser';
import { itMaps } from '//lib/testing';
import { Logger } from '//lib/metalogger/Logger';
import { Level, LEVEL_NAME_PAD_LENGTH } from '//lib/metalogger/Level';
import { LevelSpec } from '//lib/metalogger/LevelSpec';
import type { LevelName, LevelRank } from '//lib/metalogger/Level';

describe('metalogger/Logger.js', () => {
  
  describe("Logger", () => {
    describe("#getDelta", () => {      
      it("starts at undefined", () => {
        const logger = new Logger();
        expect(logger.getDelta(new Date())).to.be.undefined;
      });
      
      it("gets the difference in ms", () => {
        const logger = new Logger();
        logger.lastMessageDate = new Date();
        const now = new Date(logger.lastMessageDate.getTime() + 888);
        expect(logger.getDelta(now)).to.equal(888);
      });
    }); // #getDelta
    
    // describe(".formatDelta", () => {
    //   itMaps({
    //     func: Logger.formatDelta.bind(Logger),
    //     map: (f, throws) => [
    //       f(), '+----ms',
    //       f(0), '+0000ms',
    //       f(888), '+0888ms',
    //       f(9999), '+9999ms',
    //       f(10000), '+++++ms',
    //     ]
    //   });
    // }); // .formatDelta
    
    // describe(".formatHeader", () => {
    //   const level = Level.DEBUG;
    //   const date = new Date(2016, 9-1, 14, 17, 33, 44, 888);
    //   const delta = 888;
    //   
    //   const message = {
    //     level,
    //     refs: false,
    //     notif: false,
    //     formattedLevel: Logger.formatLevel(level),
    //     date: date,
    //     formattedDate: Logger.formatDate(date, 'YYYY-MM-DD HH:mm:ss.SSS'),
    //     path: '/imports/api/blah.js:x:y:8',
    //     delta,
    //     formattedDelta: Logger.formatDelta(delta),
    //     content: [],
    //   };
    //   
    //   itMaps({
    //     func: (format) => Logger.formatHeader(message, format),
    //     
    //     map: (f, throws) => [
    //       f("%date (%delta) %level [%path]"),
    //       "2016-09-14 17:33:44.888 (+0888ms) DEBUG [/imports/api/blah.js:x:y:8]",
    //     ]
    //   });
    // }); // .formatDate
    
    describe("#pushSpec", () => {
      const logger = new Logger();
      const spec = logger.pushSpec({
        file: '/a/b/c.js',
        level: 'info',
      });
      expect(spec).to.be.instanceof(LevelSpec);
      expect(logger.specs.length).to.eql(1);
      expect(logger.specs[0]).to.eql(spec);
      
      const spec2 = logger.pushSpec({
        file: "/x/y/z.js",
        level: "debug",
      });
      expect(logger.specs.length).to.eql(2);
      expect(logger.specs[0]).to.eql(spec);
      expect(logger.specs[1]).to.eql(spec2);
    }); // #pushSpec
    
    describe("#shouldLog", () => {
      const logger = new Logger();
      const spec = logger.pushSpec({
        path: '/a/b/c.js:8',
        level: 'info',
      });
      const query = {
        path: '/a/b/c.js:8',
        content: [],
      };
      
      expect(logger.shouldLog(Level.DEBUG, query)).to.be.false;
      expect(logger.shouldLog(Level.INFO, query)).to.be.true;
    });
    
  }); // Logger
}); // metalogger/Logger.js