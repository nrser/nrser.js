import t from 'tcomb';
import type { $Refinement } from 'tcomb';
import _ from '//src/lodash';

/**
* string of length one
*/
function isChar(s: string): boolean {
  return s.length === 1;
}
export type Char = string & $Refinement<typeof isChar>;

/**
* string that's not ''
*/
function isNonEmptyString(s: string): boolean {
  return s.length > 0;
}
export type NonEmptyString = string & $Refinement<typeof isNonEmptyString>;

/**
* string that's all upper case
*/
function isUpperCaseString(s: string): boolean {
  return s.toUpperCase() === s;
}
export type UpperCaseString = string & $Refinement<typeof isUpperCaseString>;
