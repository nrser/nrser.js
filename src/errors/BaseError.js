/**
* create a BaseError class when we're outside of Meteor.
* 
* adapted from Meteor's `error.js`.
* 
* @see https://github.com/meteor/meteor/blob/release/METEOR%401.4.0.1/packages/meteor/errors.js
* 
*/

// deps
import _ from '//src/lodash';

// package
import print from '../print';
import { squish } from '../string';

/**
* adapted from Meteor's
* {@link https://github.com/meteor/meteor/blob/release/METEOR%401.4.0.1/packages/meteor/helpers.js helpers.js}
* and used to make {@link BaseError} extend {@link Error}.
* 
* Sets child's prototype to a new object whose prototype is parent's
* prototype.
* 
* @example <caption>Used as:</caption>
* Meteor._inherits(ClassB, ClassA).
* _.extend(ClassB.prototype, { ... })
* 
* Inspired by CoffeeScript's `extend` and Google Closure's `goog.inherits`.
*/
function _inherits(Child, Parent) {
  // copy Parent static properties
  for (var key in Parent) {
    // make sure we only copy hasOwnProperty properties vs. prototype
    // properties
    if (_.has(Parent, key))
      Child[key] = Parent[key];
  }

  // a middle member of prototype chain: takes the prototype from the Parent
  var Middle = function () {
    this.constructor = Child;
  };
  Middle.prototype = Parent.prototype;
  Child.prototype = new Middle();
  Child.__super__ = Parent.prototype;
  return Child;
}

/**
* "name" of the error.
*/
const name = 'BaseError';

/**
* BaseError constructor.
*/
function constructor(message, details) {
  this.error = this.constructor.name;
  this.reason = message || this.constructor.defaultMessage;
  this.message = `${ message } [${ this.error }]`;
  this.details = details;  
}

/**
*
*/
export const BaseError = function(message, details) {
  // Ensure we get a proper stack trace in most Javascript environments
  if (Error.captureStackTrace) {
    // V8 environments (Chrome and Node.js)
    Error.captureStackTrace(this, BaseError);
  } else {
    // Borrow the .stack property of a native Error object.
    this.stack = new Error().stack;
  }
  // Safari magically works.
  
  // add details to message if provided
  if (typeof details !== 'undefined') {
    message += "\n" + print(details);
  }

  constructor.apply(this, [message, details]);

  this.errorType = name;
}

BaseError.squish = function(message, details): BaseError {
  return new this(squish(message), details);
}

// make BaseError inherit from 
_inherits(BaseError, Error);