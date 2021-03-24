// Imports
// ===========================================================================

// ### Deps ###

import lodash from 'lodash';
import fp from 'lodash/fp';


// Definitions
// ===========================================================================

/**
 * Our very own version of Lodash that we can proceed to screw up.
 * 
 * @see https://lodash.com/docs/
 */
const _ = lodash.runInContext();


/**
 * A *super cool* Unicode name for those that have figured out snippets and/or
 * keyboard codes (λ is `03bb` in Unicode hex, noob).
 * 
 * @see https://github.com/lodash/lodash/wiki/FP-Guide
 */
const λ = fp.convert( _ );


/**
 * A *super lame* ASCII name for those that can't Unicode.
 * 
 * Cool kids totally prefer {@link λ}.
 * 
 * @see https://github.com/lodash/lodash/wiki/FP-Guide
 */
const _fp = λ;


/**
 * Push an `input` through a Lodash Functional Programing (FP) `flow`/`pipe`.
 * 
 * ### Example ###
 * 
 * Read and write top-to-bottom:
 * 
 * ```JavaScript
 *  import { λ } from 'nrser';
 *  
 *  λ.pump(
 *    [ 1, 2, 3 ],
 *    λ.map( n => `the number ${ n }` ),
 *    λ.join( ', ' )
 *  );
 *  //=> "the number 1, the number 2, the number 3"
 * ```
 * 
 * Instead of top-to-bottom-except-the-very-bottom:
 * 
 * ```JavaScript
 *  λ.flow( // or `λ.pipe()`, same thing (aliased)
 *    λ.map( n => `the number ${ n }` ),
 *    λ.join( ', ' )
 *  )( [ 1, 2, 3 ] );
 *  //=> "the number 1, the number 2, the number 3"
 * ```
 * 
 * Though you want the form provided by Lodash FP for composition, for 
 * "top-level" use I find my form much easier to read and write.
 * 
 * @param {any} input
 *    Input to the pipeline.
 * 
 * @param  {...(input: any): any} funcs
 *    One or more Lodash FP-style functions to pipe through.
 * 
 * @return {any} Output of the pipeline.
 */
function pump( input, ...funcs ) {
  return λ.pipe( ...funcs )( input );
}


// Extension
// ===========================================================================
// 
// Mix in to our Lodashes. Note that there are also various mixins sprinkled 
// across the source, so requiring certain parts of the `NRSER` library will
// result in mixing in additional functions (see `array.js` for example). 
// 

λ.mixin({ pump });


// Exports
// ===========================================================================

// Pretty much everything in here...
export {
  _,
  λ,
  _fp,
  pump,
}

// Default is the regular Lodash.
export default _;
