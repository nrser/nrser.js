import _ from 'lodash';
import t from 'tcomb';

export const NonEmptyString = t.refinement(
  t.String,
  (s) => !_.isEmpty(s),
  'NonEmptyString'
);
