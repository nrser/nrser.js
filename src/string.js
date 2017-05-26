// @flow

// Imports
// ==========================================================================

// Package
import _ from '//src/nodash';
import print from './print';


// Types
// ==========================================================================

import type { $Refinement, $Reify } from 'tcomb';

/**
* Predicate used in {@link Line} to test if a string is a "line" (if the string
* is free of `\n` and `\r` characters).
* 
* @param {string} string
*   String to test. 
* 
* @return {boolean}
*   `true` if the string is free of line breaks.
*/
export function isLine(string: string): boolean {
  return string.indexOf("\n") === string.indexOf("\r") === -1;
}

export type Line = string & $Refinement<typeof isLine>;

export const tLine = (({}: any): $Reify<Line>);


// Exports
// ==========================================================================

/**
* make a tag function for string template literals that applies a function to
* each interpolation value when called as a string template
* 
* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
* 
* @param {function(value: <TemplateValue>): string} func
*   function to apply to each interpolation
*   value when the function `tag` returns is used as a string template tag.
*   
*   it should accept any types that will be provided in the string templates
*   and return a string.
* 
* @return {function(strings: string[], ...values:Array<TemplateValue>): string}
*   function that can be uses as a string template tag.
*/
export function tag(func: (value: *) => string) {
  return (strings: Array<string>, ...values: Array<*>) => {
    if (_.isArray(strings)) {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        result += func(values[i]) + strings[i + 1];
      }
      return result;
    } else {
      return func(strings);
    }
  }
}

/**
* Replace consecutive whitespace with a single space and removes leading
* and trailing whitespace. Can be used as a template literal.
* 
* @param {string|Array<string>} strings
*  String to squish.
* 
* @param {...string} values
*   Values to interpolate.
* 
* @return {string}
*   Squished output.
*/
export function squish(
  strings: Array<string> | string,
  ...values: Array<string>
) {
  let input: string;
  
  if (Array.isArray(strings)) {
    input = strings[0];
    for (let i = 0; i < values.length; i++) {
      input += values[i] + strings[i + 1];
    }
  } else {
    input = strings;
  }
  
  return input
    .replace(/\s+/g, " ")
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');
}

/**
* string template tag to JSON encode values
*/
export const JSONTag = tag(JSON.stringify);

/**
* alias for {@link JSONTag}
*/
export const j = JSONTag;

// TODO doesn't work right with regex sep
export function rsplit(
  str: string,
  sep: string,
  maxsplit: number
): Array<string> {
  const split = str.split(sep);
  if (maxsplit) {
    return [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit))
  } else {
    return split
  }
} // rsplit()

export const inspect = tag(print);

export const I = inspect;

export function indent(
  str: string,
  {
    amount = 2,
    indent,
  }: {
    amount?: number,
    indent?: string,
  } = {}
) {
  indent = indent || ' '.repeat(amount);
  return indent + str.split("\n").join(`\n${ indent }`);
} // indent()

/**
* Split a string into lines WITHOUT line breaks (`\n` and `\r` characters).
* 
* @param {string} input
*   String to split.
* 
* @return {Array<Line>}
*   Array of lines in the string.
*/
export function lines(input: string): Array<Line> {
  var re=/\r\n|\n\r|\n|\r/g;

  return input.replace(re,"\n").split("\n");
}

/**
* gets the common prefix for an array of strings, which will be '' if they
* don't have any.
*/
export function commonPrefix(strings: Array<string>): string {
  var A= strings.concat().sort(), 
  a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
  while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
  return a1.substring(0, i);
}

export function isWhitespace(input: string): boolean {
  return !!input.match(/^\s*$/m);
}

export function nonWhitespaceLines(input: string): Array<string> {
  return _.reject(lines(input), isWhitespace);
}

export function leadingWhitespace(input: string): string {
  const match = input.match(/^\s+/);
  if (match) {
    return match[0];
  }
  
  return '';
}

export function findCommonIndent(input: string): string {
  return commonPrefix(
    _.map(nonWhitespaceLines(input), line => leadingWhitespace(line))
  );
}

export function deindent(input: string): string {
  const indent = findCommonIndent(input);
  
  const regexp = new RegExp(`^${ indent }`, 'g');
  
  return _.map(lines(input), line => {
    // When finding the common indent we ignore lines that are all whitespace,
    // so we need to treat them differently here to get the desired results.
    if (isWhitespace(line)) {
      // The line can be any assortment of whitespace - it doesn't have to 
      // start with `indent` or any sub-string of it.
      // 
      // We use this approach because this function is for formatting output
      // for printing and it's a PITA to have strings not formatting as 
      // desired because of invisible spacing discrepancies on lines that 
      // don't even matter. You wouldn't want to use this to generate
      // whitespace-sensitive code or anything.
      // 
      // Anyways, all the most sensible thing to do seems to be just chopping
      // the first `indent.length` characters off the line. See the 
      // tests for an example of when this gets wonky, but for the core
      // purpose it should be fine.
      return line.slice(indent.length);
      
    } else {
      // Non-whitespace lines were considered when calculating the indent,
      // so they should all start with it - chop it off.
      return line.replace(regexp, '');
      
    }
  }).join("\n");
} // deindent()

export function pad(
  number: number,
  padLength: number,
  padWith: string = '0',
) {
  let padded = number.toString();
  while (padded.length < padLength) {
    padded = padWith + padded;
  }
  return padded;
} // pad()