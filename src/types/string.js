import t from 'tcomb';
import _ from 'lodash';

export const NonEmptyString = t.refinement(
  t.String,
  s => _.isEmpty(s),
  'NonEmptyString'
);

export const UpperCaseString = t.refinement(
  t.String,
  s => s.toUpperCase() === s,
  'UpperCaseString'
);