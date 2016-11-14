import Promise from 'bluebird';

/**
* bluebird dropped `defer()`, see
* 
* http://bluebirdjs.com/docs/api/deferred-migration.html
* 
* i think it's still really useful as a structure for when you need to store
* handles to reject and resolve to be called later.
*/
export class Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
