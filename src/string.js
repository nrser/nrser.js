// @flow

import _ from '//src/nodash';
import print from './print';

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
  indent + str.split("\n").join(`\n${ indent }`);
} // indent()

/**
* split a string into lines.
*/
export function lines(input: string): Array<string> {
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
  return !!input.match(/^\s+$/m);
}

export function nonWhitespaceLines(input: string): Array<string> {
  return _.reject(lines(input), line => line.match(/^\s*$/));
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
    return line.replace(regexp, '');
  }).join("\n");
}

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