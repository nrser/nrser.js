// @flow

import type { $Refinement, $Reify } from 'tcomb';

import type { Type } from './type';


/**
* The number `0`. `-0` also passes.
* 
* @typedef {number} Zero
*/
export type Zero = 0;

/**
* tcomb type for {@link Zero}.
* 
* @type {Type}
*/
export const tZero = (({}: any): $Reify<Zero>);


/**
* Predicate for {@link Integer}, calls {@link Number.isInteger}.
* 
* @param {number} number
*   The number to test.
* 
* @return {boolean}
*   True if `number` is an integer.
*/
function isInteger(number: number) {
  return Number.isInteger(number);
}

/**
* An number that is an integer.
* 
* @typedef {number} Integer
*/
export type Integer = number & $Refinement<typeof isInteger>;

/**
* tcomb type for {@link Integer}.
* 
* @type {Type}
*/
export const tInteger = (({}: any): $Reify<Integer>);


/**
* Predicate for {@link Positive}.
* 
* @param {number} number
*   The number to test.
* 
* @return {boolean}
*   True if `number` is positive.
*/
function isPositive(number: number): boolean {
  return number > 0;
}

/**
* A positive number.
* 
* @typedef {number} Positive
*/
export type Positive = number & $Refinement<typeof isPositive>;

/**
* tcomb type for {@link Positive}.
* 
* @type {Type}
*/
export const tPositive = (({}: any): $Reify<Positive>);


/**
* A positive integer.
* 
* @typedef {number} PositiveInteger
*/
export type PositiveInteger = Integer & Positive;

/**
* tcomb type for {@link PositiveInteger}.
* 
* @type {Positive}
*/
export const tPositiveInteger = (({}: any): $Reify<PositiveInteger>);


/**
* Predicate for {@link Positive}.
* 
* @param {number} number
*   The number to test.
* 
* @return {boolean}
*   True if `number` is positive.
*/
function isNegative(number: number): boolean {
  return number < 0;
}

/**
* A negative number.
* 
* @typedef {number} PositiveInteger
*/
export type Negative = number & $Refinement<typeof isNegative>;

/**
* tcomb type for {@link Negative}.
* 
* @type {Type}
*/
export const tNegative = (({}: any): $Reify<Negative>);


/**
* A negative {@link Integer}.
* 
* @typedef {number} NegativeInteger
*/
export type NegativeInteger = Integer & Negative;

/**
* tcomb type for {@link NegativeInteger}.
* 
* @type {Type}
*/
export const tNegativeInteger = (({}: any): $Reify<NegativeInteger>);


/**
* {@link Zero} or a {@link NegativeInteger}.
* 
* @typedef {number} NonPositiveInteger
*/
export type NonPositiveInteger = Zero | NegativeInteger;

/**
* tcomb type for {@link NonPositiveInteger}.
* 
* @type {Type}
*/
export const tNonPositiveInteger = (({}: any): $Reify<NonPositiveInteger>);


/**
* {@link Zero} or a {@link PositiveInteger}.
* 
* @typedef {number} NonNegativeInteger
*/
export type NonNegativeInteger = Zero | PositiveInteger;

/**
* tcomb type for {@link NonNegativeInteger}.
* 
* @type {Type}
*/
export const tNonNegativeInteger = (({}: any): $Reify<NonNegativeInteger>);
