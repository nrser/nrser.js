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
export function tag(func) {
  return (strings, ...values) => {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
      result += func(values[i]) + strings[i + 1];
    }
    return result;
  }
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
export function rsplit(str, sep, maxsplit) {
  const split = str.split(sep);
  if (maxsplit) {
    return [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit))
  } else {
    return split
  }
} // rsplit()

export function indent(str, {amount = 2, indent = null}) {
  indent = indent || new Array(amount + 1).join(' ');
  indent + str.split("\n").join(`\n${ indent }`);
} // indent()

// from https://github.com/deanlandolt/deindent/blob/9e18a472aace3abe652ea4a73e1b9d6ebe84584c/index.js
export function deindent(callSite) {
  let args = [].slice.call(arguments, 1);

  function format(str) {

    let size = -1;

    return str.replace(/\n([ \f\r\t\v]*)/g, function (m, m1) {

      if (size < 0) {
        size = m1.replace(/\t/g, '    ').length;
      }

      return '\n' + m1.slice(Math.min(m1.length, size));
    });
  }

  if (typeof callSite === 'string') {
    return format(callSite);
  }

  if (typeof callSite === 'function') {
    return function () {
      return format(callSite.apply(null, arguments));
    };
  }

  let output = callSite
    .slice(0, args.length + 1)
    .map(function (text, i) {
      return (i === 0 ? '' : args[i - 1]) + text
    })
    .join('');

  return format(output);
}