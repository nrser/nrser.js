import { NrserError } from './NrserError';

/**
* thrown by {@link mergeNoConflicts} if there is a conflict with the merge.
*/
export class MergeConflictError extends NrserError {}