import chai, { expect } from 'chai';
import { itMaps2 } from '../../lib/testing.js';
import { GulpTasks } from '../../lib/gulpTasks';
import gulp from 'gulp';

describe('gulpTasks.js', () => {
  describe('GulpTasks', () => {
    it("constructs", () => {
      const tasks = new GulpTasks(gulp, {createTasks: false});
      expect(tasks.cwd).to.equal(process.cwd());
      expect(tasks.name).to.equal('nrser');
    });
  });
});