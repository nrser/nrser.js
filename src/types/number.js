// @flow

import type { $Refinement, $Reify } from 'tcomb';

import type { Type } from './type';

function isInteger(number: number) {
  return Number.isInteger(number);
}

export type Integer = number & $Refinement<typeof isInteger>;

export type ZERO = 0;


function isPositive(number: number): boolean {
  return number > 0;
}

export type Positive = number & $Refinement<typeof isPositive>;

export type PositiveInteger = Integer & Positive;


function isNegative(number: number): boolean {
  return number < 0;
}

export type Negative = number & $Refinement<typeof isNegative>;

export type NegativeInteger = Integer & Negative;

export type NonPositiveInteger = ZERO | NegativeInteger;


/**
* Zero or a positive integer.
* 
* @typedef {number} NonNegativeInteger
*/
export type NonNegativeInteger = ZERO | PositiveInteger;

/**
* tcomb type for {@link NonNegativeInteger}.
* 
* @type {Type}
*/
export const tNonNegativeInteger = (({}: any): $Reify<NonNegativeInteger>);
