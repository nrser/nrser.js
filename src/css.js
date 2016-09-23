// @flow 

import _ from 'lodash';

/**
* a css class name that we can process is either a string or an array that
* can be flattened to an array of strings.
*/
// recursive
export type CSSClassName = string | Array<CSSClassName>;

/**
* does the actual work on a single string className.
*/
function cssNamespaceString(namespace: string, template: string): string {
  return template
    .split(' ')
    .map((name) => {
      if (name === '&') {
        return namespace;
      } else if (name.startsWith('&-')) {
        return namespace + name.slice(1);
      } else {
        return name;
      }
    })
    .join(' ');
}

/**
* replaces '&' and '&-' tokens in class name strings with a namespace
* like less does.
* 
* example:
* 
*   cssNamespace('Page', '& &-mobile') => 'Page Page-mobile'
* 
* `className` can be an array that flattens to an array of
* strings yo make it easier to build namespaces up programmatically.
* 
* example:
* 
*   cssNamespace('Page', ['&', ['&-mobile']]) => 'Page Page-mobile'
*/
export function cssNamespace(
  namespace: string,
  className: CSSClassName
): string {
  if (typeof className === 'string') {
    return cssNamespaceString(namespace, className);
    
  } else if (Array.isArray(className)) {
    return _.map(_.flattenDeep(className), (template: string): string => {
      return cssNamespaceString(namespace, template);
    }).join(' ');
    
  } else {
    throw new TypeError(
      "must be string or array that flattens to array or strings"
    );
  }
}

/**
* returns a {.cssNamespace} function bound to the namespace.
* 
* example:
* 
*   const csn = cssNamespacer('Page')
*   cns('& &-mobile') => 'Page Page-mobile'
*/
export function cssNamespacer(
  namespace: string
): (className: CSSClassName) => string {
  return cssNamespace.bind(null, namespace);
}