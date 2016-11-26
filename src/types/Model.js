// @flow

// imports
// =======

// deps
import _ from 'lodash';
import t from 'tcomb';
import create from 'tcomb/lib/create';

// package
import { squish } from '../string';
import { match } from '../match';
import { mapDefinedValues } from '../object';
import { extendProps } from './struct';

// types
// =====

import type { Type, Props } from './type';

/**
* the meta object for Model classes.
*/
export type ModelMeta = {
  kind: 'Model',
  name?: string,
  props: Props,
  defaultProps: Object,
  identity: false,
  strict: boolean,
}

// util
// ====
//
// these function are accessible as static properties on Model but are 
// defined here to make it clear that they **DO NOT** use `this` (which
// gets kinda confusing with the meta-programing involved and has to be
// handled with much care).

/**
* returns a new meta object by extending meta from the super class of
* `modelClass` with the provided values.
*/
function extendMeta(
  modelClass: Class<Model>,
  {props, strict, defaultProps}: {
    props?: Props,
    strict?: boolean,
    defaultProps?: Object,
  }
): ModelMeta {
  const superClass = Object.getPrototypeOf(modelClass);
  
  // handle strictness
  strict = match(strict,
    // if strict was not supplied (or was null) then inherit
    t.Nil, superClass.meta.strict,
    
    // otherwise it must be a boolean
    t.Boolean, strict => {
      // if the super Model is strict then this one must be too
      if (!strict && superClass.meta.strict) {
        throw new TypeError(squish`
          can't create a non-strict sub-entity of strict entity
          ${ superClass.name }
        `);
      }
      
      return strict;
    },
  );
  
  return {
    ...superClass.meta,
    name: modelClass.name,
    props: extendProps(
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
* recursively converts a value of a tcomb type to a representative javascript
* built-in value.
* 
* this is useful for storing model data or transmitting it across a network.
*/
function toJS(type: Type, value: any): any {
  // short circuit undefined and null values up front to simplify 
  // the proceeding logic
  if (value === undefined || value === null) {
    // just return that value
    return value;
  }
  
  if (type.meta.kind === 'Model') {
    return mapDefinedValues(
      type.meta.props,
      (propType: Type, key: string): any => {
        return toJS(propType, value._values[key]);
      }
    );
  }
  
  if (type.meta.kind === 'dict') {
    return mapDefinedValues(
      value,
      (dictValue: any, dictKey: string): any => {
        return toJS(type.meta.codomain, dictValue);
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
      return toJS(type.meta.type, listValue);
    });
  }
  
  return value;
}

// Model class
// ===========

/**
* `Model` is an extensible ES6 class that is also a tcomb type.
* 
* metadata is provided with `static meta = {...}` in the class declaration,
* which triggers the necessary meta-programing.
* 
* support is built in for:
* 
* -   meta-data inspection.
* -   nested structures.
* -   default property values.
* -   strict (non-extensible) property sets.
* -   property type refinement.
* -   conversion to native objects.
* 
* Model is useful on it's own, but it also serves as a building block for
* Object-Relational/Object-Document mapping software.
* 
* models check property values at construction time so you always know the
* data is valid, then perform runtime tcomb checks via an efficient
* `instanceof` test.
*/
export class Model {
  // statics
  // =======
  
  /**
  * the base meta object for models.
  */
  static _meta: ModelMeta = {
    // the tcomb kind. not sure exactly what it uses it for.
    kind: 'Model',
    
    // name is filled in when Model is extended
    name: undefined,
    
    // object mapping property names to their tcomb types
    props: {},
    
    // defaults for properties used if they're not provided in the constructor
    defaultProps: {},
    
    // true in tcomb if the constructor behaves like the identity function
    // this will always be false for Model and derived classes
    identity: false,
    
    // Model subclasses that are strict will not allow their descendant 
    // classes to add properties (since that would mean that subclass 
    // instances would not type check as super class instances).
    strict: false,
  }
  
  // util
  // ----
  //
  // these function are exposed via `Model` but do not access `this`.
  // 
  
  static extendMeta = extendMeta;
  static toJS = toJS;
  
  // tcomb type API
  // --------------
  
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
  * part of the tcomb API - the string it uses to print the type.
  * 
  * @return the class name.
  */
  static get displayName(): string {
    return this.name;
  }
  
  /**
  * getter for the meta object.
  */
  static get meta(): ModelMeta {
    return this._meta;
  }
  
  // meta-programing hooks
  // ---------------------
  
  /**
  * setter for the meta object, which is used to trigger the necessary
  * meta-programing.
  * 
  * each subclass **must** have a `static meta = ...` declaration.
  * 
  * calls `extendMeta` with the invoking class and extensions. this behavior
  * can be (carefully) extended in subclasses (like Record) to add additional
  * meta information.
  */
  static set meta(extension: Object): void {
    this._meta = this.extendMeta(this, extension);
  }
  
  // instance methods
  // ================
  
  constructor(values = {}, path = [this.constructor.displayName]) {
    const meta = this.constructor.meta;
    
    // check for extraneous values if the Model is strict 
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
    
    _.each(meta.props, (expected, key) => {
      const valuePath = path.concat(key + ': ' + t.getTypeName(expected));
      
      const actual = _.has(values, key) ? (
        values[key]
      ) : (
        meta.defaultProps[key]
      );
      
      // if (!_.has(this, key)) {
      //   Object.defineProperty(this, key, {
      //     get: function() {
      //       return this._values[key];
      //     },
      //   });
      // }
      
      let value;
      
      if (t.isType(expected) && expected.meta.kind === 'Model') {
        value = new expected(actual, path);
      } else {      
        value = create(expected, actual, valuePath);
      }
      
      this[key] = value;
    });
    
    // guess it might not be there in some browsers?
    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  } // constructor
  
  toJS(): Object {
    return this.constructor.toNativeValue(this.constructor, this);
  }
  
  toJSON(): Object {
    return this.toJS();
  }
}
