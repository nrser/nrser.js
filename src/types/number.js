// @flow

import type { $Refinement } from 'tcomb';

function isInteger(number: number) {
  return Number.isInteger(number);
}

export type Integer = number & $Refinement<typeof isInteger>;

function isPositive(number: number): boolean {
  return number > 0;
}

export type ZERO = 0;

export type Positive = number & $Refinement<typeof isPositive>;

export type PositiveInteger = Integer & Positive;

function isNegative(number: number): boolean {
  return number < 0;
}

export type Negative = number & $Refinement<typeof isNegative>;

export type NegativeInteger = Integer & Negative;

export type NonPositiveInteger = ZERO | NegativeInteger;

export type NonNegativeInteger = ZERO | PositiveInteger;
