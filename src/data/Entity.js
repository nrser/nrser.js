import _ from 'lodash';
import t from 'tcomb';
import create from 'tcomb/lib/create';

import { squish } from '../string';
import * as types from '../types';

export class Entity {
  static meta = {
    kind: 'Entity',
    // name is kinda tricky...
    // it's part of the tcomb API (though not sure how essential)
    // we'd like the name to just be the class name
    name: 'Entity',
    props: {},
    defaultProps: {},
    // true in tcomb if the constructor behaves like the identity function
    // this will always be false for Entity and derived classes
    identity: false,
    // Entity subclasses that are strict will not allow their descendant 
    // classes to add properties (since that would mean that subclass 
    // instances would not type check as super class instances).
    strict: false,
  }
  
  static extendMeta({name, props, defaultProps, strict}) {
    return {
      ...this.meta,
      name,
      props: {...this.meta.props, ...props},
      defaultProps: {...this.meta.defaultProps, ...defaultProps},
      strict,
    };
  }
  
  /**
  * part of the tcomb API. uses `instanceof` to check that the value is an
  * instance of the class.
  * 
  * since property values are validated in construction, this provides an
  * efficient way to check class membership at runtime.
  */
  static is(value) {
    return value instanceof this;
  }
  
  static getDisplayName() {
    return this.name;
  }
  
  constructor(values = {}, path = [this.constructor.getDisplayName()]) {
    const meta = this.constructor.meta
    
    // check for extraneous values if the Entity is strict 
    if (meta.strict) {
      const extraneous = _.difference(
        _.keys(values),
        _.keys(this.constructor.meta.props)
      );
      
      t.assert(_.isEmpty(extraneous), () => squish(`
        Invalid additional props ${ extraneous } supplied to
        ${ path.join('/')}
      `));
    }
    
    this._values = _.mapValues(meta.props, (expected, key) => {
      console.log({key, expected});
      
      const actual = do {
        if (_.has(values, key)) {
          values[key]
        } else {
          meta.defaultProps[key]
        }
      }
      
      if (!_.has(this, key)) {
        Object.defineProperty(this, key, {
          get: function() {
            return this._values[key];
          },
        });
      }
      
      return create(
        expected,
        actual,
        path.concat(key + ': ' + t.getTypeName(expected))
      );
    });
  }
}

// create a dynamic getter for `displayName`
// 
// tcomb uses the static `displayName` property in `getTypeName()`, so 
// we want to support it.
//
Object.defineProperty(Entity, 'displayName', {
  get: function() {
    return this.getDisplayName();
  },
});