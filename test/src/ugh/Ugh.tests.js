import _ from 'lodash';
import chai, { expect } from 'chai';
import * as helpers from '../testHelpers';
import { itMaps } from '../../../lib/testing';
import {
  Ugh,
  Pattern,
  BabelTask,
  CleanTask,
  WatchBabelTask,
} from '../../../lib/ugh';
import gulp from 'gulp';
import path from 'path';
import { squish } from '../../../lib/string';

function createUgh(options = {}): Ugh {
  const ugh = new Ugh({
    packageDir: helpers.PROJECT_ROOT,
    ...options
  });
  
  return ugh;
}

describe('ugh/Ugh.js', () => {
  describe('Ugh', () => {    
    it("constructs", () => {
      const ugh = createUgh();
      expect(ugh.packageDir).to.equal(helpers.PROJECT_ROOT);
      expect(ugh.packageName).to.equal('nrser');
    });
    
    describe('#toJSPattern', () => {
      const ugh = createUgh();
      
      it("adds the js pattern", () => {
        const src = ugh.toJSPattern('src');
        expect(src).to.be.an.instanceOf(Pattern);
        expect(src.base)
          .to.equal(ugh.resolve('src'));
        expect(src.path)
          .to.equal(ugh.resolve('src/**/*.{js,jsx,es,es6}'));
      });
    }); // #toBabelPattern
    
    describe('#resolve', () => {
      const ugh = createUgh();
      
      itMaps({
        func: ugh.resolve.bind(ugh),
        map: (f, throws) => [
          f('src', '../lib'), path.join(ugh.packageDir, 'lib'),
        ]
      })
    }); // # resolve
    
    describe('#relative', () => {
      const ugh = createUgh();
      
      itMaps({
        func: ugh.relative.bind(ugh),
        map: (f, throws) => [
          f(path.join(ugh.packageDir, 'lib')), 'lib',
          f(Pattern.fromPath(ugh.resolve('src/**/**.js')), '../lib'), 'lib',
        ]
      })
    }); // #relative
    
    describe('#clean', () => {
      let ugh;
      
      beforeEach(() => {
        ugh = createUgh();
        
        ugh.clean({
          id: 'src',
          dest: 'lib',
        });
      });
      
      it("adds a CleanTask to ugh", () => {
        expect(ugh.tasksByName)
          .to.satisfy(x => _.size(x) === 1)
          .and.to.have.property('clean:src')
          .that.is.an.instanceOf(CleanTask)
          .with.property('name')
          .that.equals('clean:src');
        
        expect(ugh.tasks)
          .to.have.lengthOf(1)
          .with.deep.property('[0]')
          .that.is.an.instanceOf(CleanTask)
          .with.property('name')
          .that.equals('clean:src');
        
        expect(ugh.cleanTaskNames)
          .to.have.members(['clean:src']);
      });
      
      it("adds 'clean:<id>' and 'clean' tasks to gulp", () => {
        ugh.createGulpTasks(new gulp.Gulp());
        
        expect(_.keys(ugh.gulp.tasks))
          .to.include.members(['clean', 'clean:src']);
        expect(ugh.gulp.tasks['clean'].dep)
          .to.have.members(['clean:src']);
      });
    }); // #clean
    
    describe('#babel', () => {
      describe ("creating *just* a babel task for 'src'", () => {
        let ugh;
        
        beforeEach(() => {
          ugh = createUgh();
          
          ugh.babel({
            id: 'src',
            src: 'src',
            clean: false,
            watch: false,
          });
        });
        
        it("adds a single BabelTask to ugh", () => {
          expect(ugh.tasks).to.have.lengthOf(1);
          expect(ugh.babelTasks).to.have.lengthOf(1);
          expect(ugh.tasks[0]).to.be.an.instanceOf(BabelTask);
        });
        
        it("adds 'babel:src' and 'babel' tasks to gulp", () => {
          ugh.createGulpTasks(new gulp.Gulp());
          
          expect(_.keys(ugh.gulp.tasks))
            .to.include.members(['babel', 'babel:src']);
          expect(ugh.gulp.tasks['babel'].dep)
            .to.have.members(['babel:src']);
        });
        
        it("defaults src to have the correct path, pattern and base", () => {
          const task = ugh.tasks[0];
          expect(task.src.path)
            .to.equal(ugh.resolve('src/**/*.{js,jsx,es,es6}'));
          expect(task.src.base)
            .to.equal(ugh.resolve('src'));
          expect(task.src.pattern)
            .to.equal('**/*.{js,jsx,es,es6}');
        });
      }); // just babel task
      
      describe("creating a babel task for src with a clean task", () => {
        let ugh;
        
        beforeEach(() => {
          ugh = createUgh();
          
          ugh.babel({
            id: 'src',
            src: 'src',
            clean: true,
            watch: false,
          });
        });
        
        it("adds a BabelTask and a CleanTask to ugh", () => {
          expect(ugh.babelTasks).to.have.lengthOf(1);
          expect(ugh.cleanTasks).to.have.lengthOf(1);
        });
        
        it(`adds babel and clean tasks to gulp`, () => {
          ugh.createGulpTasks(new gulp.Gulp());
          
          expect(_.keys(ugh.gulp.tasks))
            .to.include.members([
              'babel',
              'babel:src',
              'clean',
              'clean:babel:src',
            ]);
            
          expect(ugh.gulp.tasks['babel'].dep)
            .to.have.members(['babel:src']);
        });
      }); // babel and clean tasks
      
    }); // #babel
    
    describe('watchBabel', () => {
      let ugh;
      
      beforeEach(() => {
        ugh = createUgh();
        
        ugh.watchBabel({
          id: 'src',
          src: 'src',
        });
      });
      
      it("adds a WatchBabelTask to ugh", () => {
        expect(ugh.tasksByName)
          .to.satisfy(x => _.size(x) === 1)
          .and.to.have.property('watch:babel:src')
          .that.is.an.instanceOf(WatchBabelTask)
          .with.property('name')
          .that.equals('watch:babel:src');
        
        _.each([ugh.tasks, ugh.watchBabelTasks], (tasks) => {
          expect(tasks)
            .to.have.lengthOf(1)
            .with.deep.property('[0]')
            .that.is.an.instanceOf(WatchBabelTask);
        });
        
        expect(ugh.watchBabelTaskNames)
          .to.have.members(['watch:babel:src']);
      });
      
    }); // watchBabel
  }); // Ugh
});