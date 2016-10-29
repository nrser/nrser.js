import {
  _,
  PROJECT_ROOT,
  chai,
  expect,
  itMaps,
  path,
  Expect,
} from '../testHelpers';

import {
  Package,
} from '../../../lib/ugh/Package';

describe('file ugh/Package.js', () => {
  describe('class Package', () => {    
    itMaps({
      func: (...args) => {
        return new Package(...args);
      },
      
      map: (f, throws) => [
        f(PROJECT_ROOT), new Expect({
          instanceOf: Package,
          props: {
            dir: PROJECT_ROOT,
            name: 'nrser',
            json: new Expect({
              props: {
                name: 'nrser',
              }
            }),
          },
        }),
        
        f(), throws(TypeError),
        
        f(''), throws(TypeError),
        
        f(process.env.HOME), throws(Error, /ENOENT/),
      ]
    });
  }); // class Package
}); // file ugh/Package.js
