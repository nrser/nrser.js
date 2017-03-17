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
* the *environment* dictates how things are built and behave
* (versus "app instance", which declares *where* it's running / what it's
* doing -- see {@link .appInstance}).
* 
* the value is read from the `NODE_ENV` environment variable at 
* `process.env.NODE_ENV` on the server and from `window.ENV` on the client.
* 
* if neither of these are found, throws a {@link StateError}.
* 
* the environment can be set to anything, though unless you have given
* considerable through and uncovered sufficient reason, it should probably 
* be one of:
* 
* 1.  `development` (default)
* 2.  `production`
* 3.  `test`
* 
* libraries and apps can of course respond to these values however they like,
* but the general thematic should follow:
* 
* 1.  **`development`** (default)
*     
*     built and configured for development and debugging. this env
*     should make it as easy as possible to work on the app, at the 
*     expense of performance.
*     
*     things we expect in the development environment:
*     
*     -   lots of logging available.
*         -   means [metalog][] is not stripping anything accept
*             perhaps `trace` logging at compile time (via `.babelrc`
*             config -- can still filter in runtime of course).
*     -   quick and clear access to source code.
*         -   no [minification][] or concatenation.
*         -   source maps where necessary.
*     -   tcomb type checking
*         -   tcomb skips most checks in `production` mode by default, but it
*             should be checking and throwing errors when things fail in 
*             `development`.
*     -   fail early and often
*         -   while it makes sense to try and continue on in `production`, when
*             in `development` anything unexpected should throw an error
*             immediately.
*    
* 2.  **`production`**
*     
*     built and configured for performance.
*     
* 3.  **`test`**
*     
*     the environment set inside testing processes (mocha or whatever else).
*     
*     generally the same as `development`, with potential modifications to 
*     support testing. 
*     
*     be aware that if testing frameworks are using ES2015+ source they will
*     be doing the transformation under the `test` environment, and be sure
*     to cover it in `.babelrc` if using `env` switching.
* 
* [minification]: https://en.wikipedia.org/wiki/Minification_(programming)
* [metalog]: https://github.com/nrser/babel-plugin-metalog
* 
* @return {string}
*   the environment name.
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

/**
* the *app instance* is an identifier for *where* the app is deployed that 
* build settings and runtime behavior can be dependent on. it is read from
* the `NODE_APP_INSTANCE` environment variable on the server 
* 
* 
* 
* @return {?string}
*   the app instance name (if any).
*/
export function appInstance() {
  
}
