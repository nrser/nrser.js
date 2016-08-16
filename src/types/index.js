// @flow

import _ from 'lodash';
import t from 'tcomb';
import type { $Reify } from 'tcomb';
import Promise from 'promise';

export const Undefined = t.irreducible('Undefined', (v) => _.isUndefined(v));

export const Null = t.irreducible('Null', v => _.isNull(v));

export function nullable(type) {
  return t.union(Null, type);
}

export const Empty = t.irreducible('Empty', (v) => _.isEmpty(v));

export const Integer = t.refinement(
  t.Number,
  n => Number.isInteger(n),
  'Integer'
);

export const PositiveInteger = t.refinement(
  Integer,
  i => i > 0,
  'PositiveInteger'
);

export const NegativeInteger = t.refinement(
  Integer,
  i => i < 0,
  'NegativeInteger'
);

export const NonPositiveInteger = t.refinement(
  Integer,
  i => i <= 0,
  'NonPositiveInteger'
);

export const NonNegativeInteger = t.refinement(
  Integer,
  i => i >= 0,
  'NonNegativeInteger'
);

export function instanceOf(klass, name) {
  return t.irreducible(
    name || `InstanceOf<${ klass.name }>`,
    obj => obj instanceof klass,
  );
}

export const ErrorType = instanceOf(Error);

export const PromiseType = instanceOf(Promise);

/**
* @typedef {string | Array<string|number>} KeyPath
*/
export type KeyPath = string | Array<string|number>;

export * from './string.js';
export * from './value.js';
export * from './list.js';
export * from './struct.js';