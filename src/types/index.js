// @flow

// Imports
// ===========================================================================

// Deps
import t from 'tcomb';
import Promise from 'bluebird';

// Package
import _ from '//src/nodash';


// Exports
// ===========================================================================

export const Undefined = t.irreducible('Undefined', (v) => _.isUndefined(v));

export const Null = t.irreducible('Null', v => _.isNull(v));

export function nullable(type) {
  return t.union(Null, type);
}

export const Empty = t.irreducible('Empty', (v) => _.isEmpty(v));

export function instanceOf(klass, name) {
  return t.irreducible(
    name || `InstanceOf<${ klass.name }>`,
    obj => obj instanceof klass,
  );
}

export function subclassOf(klass, name) {
  return t.irreducible(
    name || `SubclassOf<${ klass.name }>`,
    obj => obj && obj.prototype && (obj.prototype instanceof klass)
  );
}

export const ErrorType = instanceOf(Error);

export const PromiseType = instanceOf(Promise);

export * from './number';
export * from './string';
export * from './value';
export * from './list';
export * from './struct';
export * from './collection';
