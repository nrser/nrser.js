// @flow

// Imports
// ==========================================================================

// Deps
// --------------------------------------------------------------------------

import type { $Refinement, $Reify } from 'tcomb';


// Package
// --------------------------------------------------------------------------


// Exports
// ==========================================================================

/**
* Interface for a reasonable Promise implementation - should cover Node and
* browser native implementation, as well as Bluebird.
* 
* @typedef {Object} IPromise
*/
export type IPromise<V,E> = {
  then: (
    onFulfilled: (value: V) => *,
    onRejected: (reason: E) => *,
  ) => IPromise,
  
  catch: (
    onRejected: (reason: E) => *
  ) => IPromise,
};

/**
* tcomb type for {@link IPromise}.
* 
* @type {Type}
*/
export const tIPromise = (({}: any): $Reify<IPromise>);

