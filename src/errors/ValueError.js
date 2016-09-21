import { BaseError } from './BaseError.js';

/**
* thrown when a value is not acceptable (versus it being a TypeError if it's
* the wrong type).
*/
export class ValueError extends BaseError {}