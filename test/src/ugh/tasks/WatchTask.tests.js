import { chai, expect, resolve, itMaps } from 'nrser/test/lib/testHelpers';

import path from 'path';
import gulp from 'gulp';
import { Ugh, Pattern, WatchTask } from 'nrser/lib/ugh';

describe('ugh/tasks/WatchTask.js', () => {
  describe('WatchTask', () => {
    const ugh = new Ugh(gulp);
    
    const src = ugh.toPattern('src/**/*.js');
    const test = ugh.toPattern('test/src/**/*.js');
    
    const task = new WatchTask({
      ugh: ugh,
      id: 'testing',
      name: 'watch:testing',
      watch: [
        src,
        test,
      ]
    });

    describe('#getWatchPattern', () => {
      itMaps({
        func: task.getWatchPattern.bind(task),
        map: (f, throws) => [
          f('src/index.js'), src,
          f('test/src/x/y.js'), test,
          f('src/x.jsx'), throws(),
          // f(''), src,
        ]
      });
    });

    describe("#filepathToPattern", () => {
      itMaps({
        func: task.filepathToPattern.bind(task),
        
        tester: ({actual, expected}) => {
          expect(actual)
            .to.have.property('base')
            .that.equals(ugh.resolve(expected.base));
            
          expect(actual)
            .to.have.property('pattern')
            .that.equals(expected.pattern);
        },
        
        map: (f, throws) => [
          f('src/index.js'), {base: 'src', pattern: 'index.js'},
          f('test/src/x/y/z.js'), {base: 'test/src', pattern: 'x/y/z.js'},
        ]
      })
    });
  }); // WatchTask
  
}); // ugh/tasks/WatchTask.js