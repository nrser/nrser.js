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
    
    describe(".formatDelta", () => {
      itMaps2({
        func: Logger.formatDelta.bind(Logger),
        map: (f, throws) => [
          f(), '+----ms',
          f(0), '+0000ms',
          f(888), '+0888ms',
          f(9999), '+9999ms',
          f(10000), '+++++ms',
        ]
      });
    }); // .formatDelta
    
    describe(".formatDate", () => {
      const date = new Date(2016, 9-1, 14, 17, 33, 44, 888);
      
      itMaps2({
        func: (format) => Logger.formatDate(date, format),
        
        map: (f, throws) => [
          f('YYYY'), '2016',
          f('YYYY-MM-DD HH:mm:ss.SSS'), '2016-09-14 17:33:44.888',
          f('MM MM'), '09 09',
        ]
      });
    }); // .formatDate
    
    describe(".formatHeader", () => {
      const level = Level.DEBUG;
      const date = new Date(2016, 9-1, 14, 17, 33, 44, 888);
      const delta = 888;
      
      const message = {
        level,
        refs: false,
        notif: false,
        formattedLevel: Logger.formatLevel(level),
        date: date,
        formattedDate: Logger.formatDate(date, 'YYYY-MM-DD HH:mm:ss.SSS'),
        path: '/imports/api/blah.js:x:y:8',
        delta,
        formattedDelta: Logger.formatDelta(delta),
        content: [],
      };
      
      itMaps2({
        func: (format) => Logger.formatHeader(message, format),
        
        map: (f, throws) => [
          f("%date (%delta) %level [%path]"),
          "2016-09-14 17:33:44.888 (+0888ms) DEBUG [/imports/api/blah.js:x:y:8]",
        ]
      });
    }); // .formatDate
    
  }); // Logger
}); // metalogger/Logger.js