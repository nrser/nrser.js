// @flow

import _ from 'lodash';
import t from 'tcomb';
import Promise from 'promise';

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
    name || `SubclassOf<${ klass.name }`,
    obj => obj.prototype instanceof klass
  );
}

export const ErrorType = instanceOf(Error);

export const PromiseType = instanceOf(Promise);

/**
* @typedef {string | Array<string|number>} KeyPath
*/
export type KeyPath = string | Array<string|number>;


export * from './number';
// import type { Integer as _Integer } from './number';
// export type Integer = _Integer;

export * from './string.js';
export * from './value.js';
export * from './list.js';
export * from './struct.js';
