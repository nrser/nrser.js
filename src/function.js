// @flow

// Types
// ==========================================================================

import type { $Refinement, $Reify } from 'tcomb';

/**
* A Node-style callback that accepts an optional {@link Error} as it's 
* first argument and an optional result as it's second.
* 
* @typedef {function(err: ?Error, result: *): undefined} NodeCallback
*/
export type NodeCallback = (err: ?Error, result: *) => void;

/**
* tcomb type for {@link NodeCallback}.
*
* @type {Type}
*/
export const tNodeCallback = (({}: any): $Reify<NodeCallback>);
