import chai, {expect} from 'chai';
import _ from 'lodash';
import { itMaps2 } from '../../../lib/testing.js';
import { Logger } from '../../../lib/metalogger/Logger';
import { Level, LEVEL_NAME_PAD_LENGTH } from '../../../lib/metalogger/Level';
import type { LevelName, LevelRank } from '../../../lib/metalogger/Level';

describe('metalogger/Logger.js', () => {
  
  describe("Logger", () => {
    describe("#getConsoleFunction", () => {
      itMaps2({
        func: level => (new Logger()).getConsoleFunction(level),
        map: (f, throws) => [
          f(Level.ERROR), (console.error || console.log),
          f(Level.WARN), (console.warn || console.log),
          f(Level.INFO), (console.info || console.log),
          f(Level.DEBUG), console.log,
          f(Level.TRACE), console.log,
        ],
      })
    }); // #getConsoleFunction
    
    describe("#getDeltaString", () => {      
      it("starts at (+----ms)", () => {
        const logger = new Logger();
        expect(logger.getDeltaString(new Date())).to.equal('+----ms');
      });
      
      it("builds a short delta string", () => {
        const logger = new Logger();
        logger.lastMessageDate = new Date();
        const current = new Date(logger.lastMessageDate.getTime() + 888);
        expect(logger.getDeltaString(current)).to.equal('+0888ms');
      });
      
      it("overflows to +++++ms when delta is over 9999", () => {
        const logger = new Logger();
        logger.lastMessageDate = new Date();
        const builds = new Date(logger.lastMessageDate.getTime() + 9999);
        expect(logger.getDeltaString(builds)).to.equal('+9999ms');
        const overflows = new Date(logger.lastMessageDate.getTime() + 10001);
        expect(logger.getDeltaString(overflows)).to.equal('+++++ms');
      });
    }); // #getDeltaString
  }); // Logger
}); // metalogger/Logger.js