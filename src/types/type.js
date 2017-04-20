// @flow

/**
* tcomb type meta object
* 
* @see http://gcanti.github.io/tcomb/guide/index.html
* @see https://archive.is/3JwrZ
* 
* @see https://github.com/gcanti/tcomb/blob/master/docs/API.md
* @see https://archive.is/C6Iqh
*/
export type Meta = {
  // the type kind, equal to "irreducible" for irreducible types
  //
  // other types include 'struct' for `Struct` types created with `t.struct`
  // and 'Model' for subclasses of our Model class.
  // 
  kind: string,
  
  // the type name
  // 
  // this can be undefined, like when creating a Struct with t.struct and
  // not prodiving a `name` in the options.
  //
  name?: string,
  
  // if true, `tcomb/lib/create` will create a instance with `type(value)`.
  // if false (*and* `type` is an object *and* value is not `null`) it will
  // use `new type(value)`
  identity?: boolean,
}

/**
* a tcomb type.
* 
* this is to support flow; if you need to test in runtime use tcomb's t.Type.
* 
* @typedef {Object} Type
*/
export type Type = {
  meta: Meta,
  displayName: string,
  is: (value: any) => boolean,
}

/**
* tcomb props - an object mapping property names to their tcomb type.
*/
export type Props = {[name: string]: Type};