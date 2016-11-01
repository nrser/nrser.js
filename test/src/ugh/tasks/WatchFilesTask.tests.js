import { chai, expect, resolve, itMaps } from '../../testHelpers';

import path from 'path';
import gulp from 'gulp';
import { Ugh, Pattern, WatchFilesTask } from '../../../../lib/ugh';

describe('ugh/tasks/WatchFilesTask.js', () => {
  describe('WatchFilesTask', () => {
    const ugh = new Ugh({gulp, packageDir: process.cwd()});
    
    const src = ugh.toPattern('src/**/*.js');
    const test = ugh.toPattern('test/src/**/*.js');
    
    const task = new WatchFilesTask({
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
    
    describe('.typeName', () => {
      expect(WatchFilesTask.typeName).to.eql(['watch', 'files']);
    });
  }); // WatchTask
  
}); // ugh/tasks/WatchTask.js