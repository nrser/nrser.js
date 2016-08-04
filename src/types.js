import _ from 'lodash';
import t from 'tcomb';
import type { $Reify } from 'tcomb';

export const Undefined = t.irreducible('Undefined', (v) => _.isUndefined(v));
export const Empty = t.irreducible('Empty', (v) => _.isEmpty(v));

export const NonEmptyString = t.refinement(
  t.String,
  (s) => !_.isEmpty(s),
  'NonEmptyString'
);

export function nonEmptyList(type, name) {
  return t.refinement(
    t.list(type, name),
    array => array.length > 0,
    name || `NonEmptyArray<${ t.getTypeName(type) }>`
  )
}

export type KeyPath = string | Array<string|number>;
