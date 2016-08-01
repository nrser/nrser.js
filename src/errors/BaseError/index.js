import { Meteor } from '../../env.js';

export var BaseError;

if (Meteor) {
  // if we are in meteor, BaseError extends Meteor.Error
  BaseError = require('./BaseError.meteor.js').BaseError;
} else {
  // if not, define the same API independently
  BaseError = require('./BaseError.js').BaseError;
}
