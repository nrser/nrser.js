import chai, { expect } from 'chai';
import { itMaps2 } from '../../lib/testing.js';
import { GulpTasks } from '../../lib/gulpTasks';
import { Src } from '../../lib/gulpTasks/util';
import gulp from 'gulp';

function descMap(name, func, map) {
  describe(name, () => {
    itMaps2({func, map});
  });
}

describe('gulpTasks', () => {
  describe('GulpTasks', () => {
    it("constructs", () => {
      const tasks = new GulpTasks(gulp, {createTasks: false});
      expect(tasks.cwd).to.equal(process.cwd());
      expect(tasks.name).to.equal('nrser');
    });
  });
  
  describe('Src', () => {
    it('defaults base properly', () => {
      const src = new Src('src/**/*.js');
      expect(src.base).to.equal('src/');
    });
  });
});