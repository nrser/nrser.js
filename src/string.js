/**
* replace consecutive whitespace with a single space and removes leading
* and trailing whitespace.
* 
* @param {string} input
*  string to squish
* 
* @return {string} squished output.
*/
export function squish(input) {
  return input
    .replace(/\s+/g, " ")
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');
}

/**
* make a tag function for string template literals that applies a function to
* each interpolation value.
* 
* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
* 
* @param {function(string):string} function to apply to each interpolation
*   value when the result is used as a string template tag.
* 
* @return {function(strings:string[], ...values):string}
*   function that can be uses as a string template tag.
*/
export function tag(func) {
  return (strings, ...values) => {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
      result += func(values[i]) + strings[i + 1];
    }
    return result;
  }
}