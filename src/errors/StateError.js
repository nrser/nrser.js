import { BaseError } from './BaseError';

/**
* thrown when something is in the wrong state for an operation to succeed.
*/
export class StateError extends BaseError {}