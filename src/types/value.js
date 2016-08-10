import t from 'tcomb';
import _ from 'lodash';

import { UpperCaseString } from './string.js';

/**
* create a type that just wraps a specific value. `is()` uses `===`.
*/
export function value(value, name) {
  return t.irreducible(
    name || `Value<${ value  }>`,
    v => v === value,
  );
}

/**
* `values()` creates a union type for each of the values in the provided
* object.
*/
export function values(obj, name) {
  const valueTypes = _.mapValues(t.Object(obj), (v) => value(v));
  const type = t.union(_.values(valueTypes));
  type.types = valueTypes;
  type.values = {};

  _.each(obj, (v, k) => {
    UpperCaseString(k);

    // shouldn't happen since props are not upper case
    if (_.has(type, k)) {
      throw new errors.ValueError(squish(`
        can\'t provide key ' + k + ' because union type defines the property
      `));
    }

    // convenient accessor, like VALUES.X
    type[k] = v;

    // nice for iteration of the values
    type.values[k] = v;
  });

  return type;
}

values.of = function (array) {
  var obj = {};

  for (var i = 0, len = array.length; i < len; i++) {
    obj[array[i]] = array[i];
  }

  return values(obj);
};