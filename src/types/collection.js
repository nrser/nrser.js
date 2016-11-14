
/**
* lodash-style collection.
*/
export type Collection<V> = Array<V> | {[key: string]: V};

/**
* deep 'path' to a value in a collection (array or object).
* 
* @typedef {string | Array<string|number>} KeyPath
*/
export type KeyPath = string | Array<string|number>;
