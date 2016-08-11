import { NrserError } from './NrserError.js';

/**
* thrown when a value fails to match a pattern in `match()`
*/
export class MatchError extends NrserError {}