import _ from 'lodash';
import t from 'tcomb';

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