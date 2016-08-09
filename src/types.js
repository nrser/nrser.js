// @flow

import _ from 'lodash';
import t from 'tcomb';
import type { $Reify } from 'tcomb';

export const Undefined = t.irreducible('Undefined', (v) => _.isUndefined(v));
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

export const NonEmptyString = t.refinement(
  t.String,
  s => !_.isEmpty(s),
  'NonEmptyString'
);

export function nonEmptyList(type, name) {
  return t.refinement(
    t.list(type, name),
    array => array.length > 0,
    name || `NonEmptyArray<${ t.getTypeName(type) }>`
  )
}

/**
* @typedef {string | Array<string|number>} KeyPath
*/
export type KeyPath = string | Array<string|number>;
