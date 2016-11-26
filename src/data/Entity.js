import _ from 'lodash';
import t from 'tcomb';
import create from 'tcomb/lib/create';

import { squish } from '../string';
import { match } from '../match';
import * as types from '../types';
import { mapDefinedValues } from '../object';

import type { Type } from '../types';

export class Entity {
  static _meta = {
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
  
  static get meta() {
    return this._meta;
  }
  
  static set meta(extension) {
    this._meta = this.extendMeta({name: this.name, ...extension});
  }
  
  static extendMeta({name, props, strict, defaultProps}) {
    // when called on Entity itself we don't want to walk up the chain
    // further, we want to get the meta from Entity itself.
    const superClass = this === Entity ? this : Object.getPrototypeOf(this);
    
    // handle strictness
    strict = match(strict,
      // if strict was not supplied (or was null) then inherit
      t.Nil, superClass.meta.strict,
      
      // otherwise it must be a boolean
      t.Boolean, strict => {
        // if the super Entity is strict then this one must be too
        if (!strict && superClass.meta.strict) {
          throw new TypeError(squish(`
            can't create a non-strict sub-entity of strict entity
            ${ superClass.name }
          `));
        }
        
        return strict;
      },
    );
    
    return {
      ...superClass.meta,
      name,
      props: types.extendProps(
        superClass.meta.props,
        props,
        superClass.meta.strict,
      ),
      defaultProps: {
        ...superClass.meta.defaultProps,
        ...defaultProps
      },
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
  static is(value): boolean {
    return value instanceof this;
  }
  
  /**
  * what the getter for `displayName` calls for the tcomb API.
  */
  static getDisplayName(): string {
    return this.name;
  }
  
  static toNativeObject(type: Type, value: any): any {
    // short circuit undefined and null values up front to simplify 
    // the proceeding logic
    if (value === undefined || value === null) {
      // just return that value
      return value;
    }
    
    if (type.meta.kind === 'Entity') {
      return mapDefinedValues(
        type.meta.props,
        (propType: Type, key: string): any => {
          return this.toNativeObject(propType, value._values[key]);
        }
      );
    }
    
    if (type.meta.kind === 'dict') {
      return mapDefinedValues(
        value,
        (dictValue: any, dictKey: string): any => {
          return this.toNativeObject(type.meta.codomain, dictValue);
        }
      );
    }
    
    if (type.meta.kind === 'list') {
      // NOTE if the list has undefined value in it rethink will error when
      //      you try to persist.
      //      
      //      unlike objects, where we can drop keys with undefined values,
      //      it's not clear what we should do with undefined values in
      //      arrays - dropping them would not preserve length or index
      //      value corespondence, which can be important in arrays.
      //      
      //      the moral of the story is DON'T PUT UNDEFINED VALUES IN ARRAYS.
      //      
      return _.map(value, (listValue: any) => {
        return this.toNative(type.meta.type, listValue);
      });
    }
    
    return value;
  }
  
  constructor(values = {}, path = [this.constructor.getDisplayName()]) {
    const meta = this.constructor.meta;
    
    // check for extraneous values if the Entity is strict 
    if (meta.strict) {
      const extraneous = _.difference(
        _.keys(values),
        _.keys(meta.props)
      );
      
      t.assert(_.isEmpty(extraneous), () => squish(`
        Invalid additional props ${ extraneous } supplied to
        ${ path.join('/')}
      `));
    }
    
    this._values = _.mapValues(meta.props, (expected, key) => {
      const valuePath = path.concat(key + ': ' + t.getTypeName(expected));
      
      const actual = _.has(values, key) ? (
        values[key]
      ) : (
        meta.defaultProps[key]
      );
      
      if (!_.has(this, key)) {
        Object.defineProperty(this, key, {
          get: function() {
            return this._values[key];
          },
        });
      }
      
      if (t.isType(expected) && expected.meta.kind === 'Entity') {
        return new expected(actual, path);
      } else {      
        return create(expected, actual, valuePath);
      }
    });
  }
  
  toNativeObject(): Object {
    return this.constructor.toNativeObject(this.constructor, this);
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