import _ from 'lodash';

export function eachAsArray<Element, Result>(
  elementOrArray: Element | Array<Element>,
  iteratee: (element: Element) => Result,
): void {
  if (_.isArray(elementOrArray)) {
    _.each(elementOrArray, iteratee);
  } else {
    iteratee(elementOrArray, 0);
  }
}

export function mapAsArray<Element, Result>(
  elementOrArray: Element | Array<Element>,
  iteratee: (element: Element) => Result,
): Array<Result> {
  if (_.isArray(elementOrArray)) {
    return _.map(elementOrArray, iteratee);
  } else {
    return [iteratee(elementOrArray, 0)];
  }
}
