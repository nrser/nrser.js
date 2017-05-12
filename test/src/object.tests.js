import chai, { expect } from 'chai';
import { itMaps } from 'nrser/lib/testing';
import { t } from 'nrser';

// package
import {
  groupByEach,
  assemble,
  need,
  insert,
} from '//lib/object.js';

import _ from '//lib/lodash';

import { KeyError } from '//lib/errors/';

describe('object.js', () => {
  describe('insert()', () => {
    itMaps({
      func: insert,
      map: (f, throws) => [
        f({}, 'x', 1), {x: 1},
        f({x: 1}, 'x', 2), throws(KeyError),
        f({x: undefined}, 'x', 2), throws(KeyError),
        f({x: 1}, 'y', 2), {x: 1, y: 2},
      ]
    });
    
    context("through _.insert", function() {
      itMaps({
        func: _.insert.bind(_),
        map: (f, throws) => [
          f({}, 'x', 1), {x: 1},
          f({x: 1}, 'x', 2), throws(KeyError),
          f({x: undefined}, 'x', 2), throws(KeyError),
          f({x: 1}, 'y', 2), {x: 1, y: 2},
        ]
      });
    });
  });
  
  describe('assemble()', () => {
    it("returns {} when args are empty", () => {
      expect(assemble()).to.eql({});
    });
    
    // it("throws on bad args", () => {
    //   expect(() => mergeNoConflicts(1, 2, 3)).to.throw(TypeError);
    // });
    
    it("succeeds when there are no conflicts", () => {
      expect(
        assemble({a: 1}, {b: 2}, {c: 3, d: 4})
      ).to.eql({a: 1, b: 2, c: 3, d: 4});
    });
    
    it("fails when there are conflicts", () => {
      expect(() => {
        assemble({a: 1}, {a: 2})
      }).to.throw(KeyError);
    });
  });
  
  describe("need()", () => {
    itMaps({
      func: need,
      
      map: (f, throws) => ([
        f({x: 1}, []),                            {x: 1},
        f({x: 1}, ['x']),                         1,
        f({x: [{y: 'why'}]}, ['x', 0, 'y']),      'why',
        f({x: [{y: 'why'}]}, 'x.0.y'),            'why',
        f({}, 'a'),                               throws(KeyError),
        
        // specifying default value:
        f({}, 'a', {defaultValue: 'blah'}),       'blah',
        
        // specifying type:
        f({x: 1}, 'x', {type: t.String}),         throws(TypeError),
        f({x: 1}, 'x', {type: t.Number}),         1,
        
        // default value and type:
        f({x: 1}, 'y', {defaultValue: 2, type: t.Number}), 2,
        f({x: 1}, 'y', {defaultValue: 2, type: t.String}), throws(TypeError),
      ]),
    })
  });
  
  describe("groupByEach()", () => {
    itMaps({
      func: groupByEach,
      
      map: (f, throws) => [
        f(
          [
            {name: 'neil', groups: ['admin', 'dev']},
            {name: 'angus', groups: ['admin', 'production', 'art']},
            {name: 'josh', groups: ['production', 'art', 'design']},
          ],
          ({name, groups}) => groups,
        ),
        // =>
        {
          admin: [
            {name: 'neil', groups: ['admin', 'dev']},
            {name: 'angus', groups: ['admin', 'production', 'art']},
          ],
          
          dev: [
            {name: 'neil', groups: ['admin', 'dev']},
          ],
          
          production: [
            {name: 'angus', groups: ['admin', 'production', 'art']},
            {name: 'josh', groups: ['production', 'art', 'design']},
          ],
          
          art: [
            {name: 'angus', groups: ['admin', 'production', 'art']},
            {name: 'josh', groups: ['production', 'art', 'design']},
          ],
          
          design: [
            {name: 'josh', groups: ['production', 'art', 'design']},
          ],
        },
        
      ],
    });
  });
});