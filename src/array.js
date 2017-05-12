// @flow

import _ from '//src/lodash';

/**
* If `subject` is an {@link Array}, return it. Otherwise return a new Array
* containing only it.
* 
* @todo
*   Only deals with {@link Array} *exactly*. Might want to think about 
*   {@link Set} and others?
* 
* @param {Element|Array<Element>} subject
*   Value that may be a single element or an array of elements.
* 
* @return {Array<Element>}
*   `subject` or an new array of only `subject`.
*   
*/
export function asArray<Element>(
  subject: Element | Array<Element>
): Array<Element> {
  if (_.isArray(subject)) {
    return subject;
  }
  return [subject];
}

/**
* Treat `subject` as an Array whether it is or not - if `subject` is an 
* {@link Array} invoke `iteratee` on each element. Otherwise just invoke 
* `iteratee` on `subject` itself.
* 
* Like `_.each(asArray(x), f)` but avoids the allocation of a new array when
* `x` is not one.
* 
* Except... `iteratee` should be only relied on to be invoked with 
* `(element, index)`, since creating the array that would go in the third
* position pretty much defeats the purpose. If you need that reference just
* use `_.each(asArray(x), f)`.
* 
* @example
*   
*   // non-array value
*   eachAsArray('uno', v => console.log(v));
*   // => uno
*   
*   // array value
*   eachAsArray(['yi', 'er', 'san'], v => console.log(v));
*   // => yi
*   //    er
*   //    san
* 
* @param {Element|Array<Element>} subject
*   Array to iterate over or non-array to invoke on.
* 
* @param {function(element: Element): Result} iteratee
*   Function to invoke on each element.
* 
* @return {undefined}
*/
export function eachAsArray<Element, Result>(
  subject: undefined | Element | Array<Element>,
  iteratee: (element: Element) => Result,
): void {
  if (_.isArray(subject)) {
    _.each(subject, iteratee);
  } else if (subject === undefined) {
    // pass
  } else {
    iteratee(subject, 0);
  }
} // eachAsArray()


/**
* Treat `subject` as an Array to be mapped over, whether it is or not.
* If `subject` is an {@link Array}, map `iteratee` over the elements.
* Otherwise just invoke `iteratee` on `subject` itself and return an array
* with only it in it.
* 
* Like `_.map(asArray(x), f)` but avoids the allocation of a new array when
* `x` is not one.
* 
* Except... `iteratee` should be only relied on to be invoked with 
* `(element, index)`, since creating the array that would go in the third
* position pretty much defeats the purpose. If you need that reference just
* use `_.map(asArray(x), f)`.
* 
* @example
*   
*   // non-array value
*   mapAsArray('uno', e => e + '!'';
*   // => ['uno!']
*   
*   // array value
*   eachAsArray(['yi', 'er', 'san'], e => e + '!'';
*   // => ['yi!', 'er!', 'san!']
* 
* @param {Element|Array<Element>} subject
*   Array to iterate over or non-array to invoke on.
* 
* @param {function(element: Element): Result} iteratee
*   Function to invoke on each element.
* 
* @return {Array<Result>}
*   Results of applying `iteratee` over subject.
*/
export function mapAsArray<Element, Result>(
  subject: Element | Array<Element>,
  iteratee: (element: Element) => Result,
): Array<Result> {
  if (_.isArray(subject)) {
    return _.map(subject, iteratee);
  } else {
    return [iteratee(subject, 0)];
  }
} // mapAsArray()

_.mixin({
  asArray,
  mapAsArray,
  eachAsArray,
});
