/**
* dealing with environment.
*/

import * as errors from './errors';

/**
* the default environment returned by {@link .env} when none is set.
* 
* @type {string}
*/
export const DEFAULT_ENV = 'development';

/**
* determine if we're in the browser by seeing if the top-level object is
* `window`.
* 
* @return {boolean}
*   true if we're in a browser environment.
*/
export const isBrowser = new Function(
  "try { return this===window; } catch(e) { return false; }"
);

/**
* determine if we're in node by seeing if the top-level object is `global`.
* 
* @return {boolean}
*   true if we're in a node environment.
*/
export const isNode = new Function(
  "try { return this===global; } catch(e) { return false; }"
);

/**
* constant that is the result of calling {@link isBrowser} on import.
* 
* @type {boolean}
*/
export const IS_BROWSER = isBrowser();

/**
* constant that is the result of calling {@link isNode} on import.
* 
* @type {boolean}
*/
export const IS_NODE = isNode();

/**
* get the environment, defaulting to {@}
* 
* @throws {StateError}
*   if we can't determine that we're in a node or browser environment.
*/
export function env() {
  if (IS_NODE) {
    return process.env.NODE_ENV || DEFAULT_ENV;
    
  } else if (IS_BROWSER) {
    return window.ENV || DEFAULT_ENV;
    
  } else {
    // TODO we might want to just proceed somehow with what we can find,
    //      but for the moment fuck it just throw.
    throw errors.StateError.squish(`
      can't detect browser OR node environment.
    `);
    
  }
} // .env
