import { BaseError } from './BaseError.js';

/**
* throw when a method needs to be implemented by a subclass.
*/
export class NotImplementedError extends BaseError {
  static defaultMessage = 'this method must be implemented in subclasses';
}