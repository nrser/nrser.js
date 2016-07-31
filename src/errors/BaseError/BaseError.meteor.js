import { Meteor } from 'meteor/meteor';

export class BaseError extends Meteor.Error {
  constructor(message, details = {}) {
    // don't pass anything since we need `this.constructor` to get the `error`
    // field
    super();
    
    // then set everything ourselves
    this.error = this.constructor.name;
    this.reason = message;
    this.message = `${ message } [${ this.error }]`;
    this.details = details;
  }
}

export class UtilError extends BaseError {}

/**
* raised by mergeNoConflicts when there is a conflict.
*/
export class MergeConflictError extends UtilError {}