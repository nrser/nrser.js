import chai, {expect} from 'chai';
import _ from 'lodash';
import { itMaps2 } from '../../../lib/testing.js';
import { Level, LEVEL_NAME_PAD_LENGTH } from '../../../lib/metalogger/Level';
import type { LevelName, LevelRank } from '../../../lib/metalogger/Level';

describe('metalogger/Level.js', () => {
  it("has LEVEL_NAME_PAD_LENGTH = 5", () => {
    expect(LEVEL_NAME_PAD_LENGTH).to.equal(5);
  });
  
  describe('type LevelName', () => {
    itMaps2({
      func: v => LevelName.is(v),
      map: f => [
        f('fatal'), true,
        f('error'), true,
        f('warn'), true,
        f('info'), true,
        f('debug'), true,
        f('trace'), true,
        f('blah'), false,
      ]
    });
  }); // type LevelName
  
  describe("type LevelRank", () => {
    itMaps2({
      func: v => LevelRank.is(v),
      map: f => [
        f(0), true,
        f(1), true,
        f(2), true,
        f(3), true,
        f(4), true,
        f(5), true,
        f(-1), false,
        f(0.1), false,
        f(6), false,
      ]
    });
  }); // type LevelRank
  
  describe("Level", () => {
    describe("Level.forName", () => {
      itMaps2({
        func: v => Level.forName(v),
        map: (f, throws) => [
          f('fatal'), Level.FATAL,
          f('error'), Level.ERROR,
          f('warn'), Level.WARN,
          f('info'), Level.INFO,
          f('debug'), Level.DEBUG,
          f('trace'), Level.TRACE,
          // f('blah'), throws(TypeError, /Invalid value \"blah\"/),
        ]
      });
    }); // Level.forName
  }); // Level
}); // metalogger/Level.js