// deps
import _ from 'lodash';
import chai, { expect } from 'chai';

// package
import { itMaps } from '../../lib/testing';
import * as nrser from '../../lib';

function describeFunc(...args) {
  let func: Function,
      funcName: string,
      map: Function;
  
  switch (args.length) {
    case 2:
      func = args[0];
      funcName = func.name;
      map = args[1];
      break;
    case 3:
      funcName = args[0];
      func = args[1];
      map = args[3];
      break;
    default:
      throw new nrser.ValueError(`expected 2 or 3 args`);
  }
  
  itMaps({func, funcName, map});
}

describe('path.js', () => {
  describe('.split', () => {
    itMaps({
      func: nrser.path.split,
      map: (f, throws) => [
        // easy case
        f('x/y/z'), ['x', 'y', 'z'],
        
        // what to do about leading /?
        f('/x/y/z'), ['x', 'y', 'z'],
      ]
    })
  });
  
  describe('absolute', () => {
    itMaps({
      func: nrser.path.absolute,
      map: (f, throws) => [
        f('~'), process.env.HOME,
        f('.'), nrser.path.resolve(),
      ]
    })
  }); // absolute
  
  describeFunc(nrser.path.commonBase, (f, throws) => [
    // entire path is common if there's only one
    f('/x/y/z'), '/x/y/z',
    
    // returns the absolute path
    f('x'), nrser.path.resolve('x'),
    
    // basic test
    f('/x/y/z', '/x/y'), '/x/y',
    
    // mess with slashes
    f('/x/y/z/', '/x/y'), '/x/y',
    f('/x/y/z/', '/x/y/'), '/x/y',
    f('/x/y/z/', '/x/y/'), '/x/y',
    f('//x/y//z/', '/x/////y/'), '/x/y',
    
    // relative
    f('x/y', 'x/y/z'), nrser.path.resolve('x/y'),
    f('.', 'x'), nrser.path.resolve(),
    
    // no common base
    f('/x/y', 'x/y'), undefined,
    
    // > 2 paths
    f('/x/y/z/', '/x/y', '/x//y/w', '/x'), '/x',
  ]);
}); // path.js
