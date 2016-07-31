import { NrserError } from './NrserError.js';

/**
* the error *we* throw when a check fails
* ours has the value that failed attached.
*/
export class CheckError extends NrserError {}