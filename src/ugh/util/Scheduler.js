// @flow

// deps
import _ from 'lodash';
import Q from 'q';

type Log = boolean | Function;

export class Scheduler {
  /**
  * flag set to true when scheduled to run.
  */
  _scheduled: boolean;
  
  /**
  * flag set to true when the operation is running
  */
  _running: boolean;
  
  /**
  * name used when logging
  */
  name: string;
  
  /**
  * function to run.
  */
  run: (onDone: DoneCallback) => void;
  
  /**
  * ms to wait after a change to run
  */
  timeout: number;
  
  /**
  * if true, will log to console. if a function will call that with
  * log messages.
  */
  log: ?Log;
  
  /**
  * deferreds to resolve when the current run completes. this is empty unless
  * we are running.
  */
  _currentRunDeferreds: Array<Q.defer>;
  
  /**
  *  deferreds to resolve when the next run completes.
  */
  _nextRunDeferreds: Array<Q.defer>;
  
  constructor(
    name: string,
    run: () => Promise<void>,
    {
      timeout = 300,
      log,
    } : {
      timeout?: number,
      log?: Log,
    } = {}
  ) {
    this.name = name;
    this.timeout = timeout;
    this.run = run;
    this.log = log;
    
    // internal state - **DO NOT TOUCH**
    this._scheduled = false;
    this._running = false;
    this._currentRunDeferreds = [];
    this._nextRunDeferreds = []
  }
  
  // public API
  // ==========
  
  // accessors
  // ---------
  
  get scheduled(): boolean {
    return this._scheduled;
  }
  
  get running(): boolean {
    return this._running;
  }
  
  /**
  * call to schedule a run.
  */
  schedule(): Promise<void> {
    this._log("scheduling...");
    
    // create a deferred to resolve when next run completes
    const deferred = Q.defer();
    this._nextRunDeferreds.push(deferred);
    
    if (this.scheduled) {
      // it's already scheduled, so we don't need to do anything
      this._log("already scheduled.");
      
    } else {
      // flag as scheduled
      this._scheduled = true;
      
      if (this.running) {
        this._log("already running, will re-schedule when done.");
        
      } else {
        this._log(`scheduling run in ${ this.timeout }ms.`);
        setTimeout(this._start.bind(this), this.timeout);
        
      }
    }
    
    return deferred.promise;
  }
  
  // private API
  // ===========
  
  /**
  * log a message if `log` is not false.
  */
  _log(...messages: Array<*>): void {
    if (!this.log) {
      return;
    }
    
    const title = `${ this.constructor.name }<${ this.name }>`;
    
    if (typeof this.log === 'function') {
      this.log(title, ...messages);
    } else {
      console.log(title, ...messages);
    }
  }
  
  /**
  * start a run of the operation
  */
  _start(): void {
    this._log("starting run.");
    
    // flag as running
    this._running = true;
    
    // unset the scheduled flag
    this._scheduled = false;
    
    // swap the next run deferreds into the current one
    this._currentRunDeferreds = this._nextRunDeferreds;
    
    // and empty the next run deferreds
    this._nextRunDeferreds = [];
    
    // start the operation
    this.run()
    
      .then(() => {
        this._log("run succeeded, resolving deferreds.");
        
        _.each(this._currentRunDeferreds, (deferred) => {
          deferred.resolve();
        });
      })
      
      .catch((error: Error) => {
        this._log("run failed, rejecting deferreds.");
        
        _.each(this._currentRunDeferreds, (deferred) => {
          deferred.resolve();
        });
      })
      
      .fin(() => {
        this._log("run complete.");
        
        // unset the running flag
        this._running = false;
        
        // clear the current deferreds to prevent confusion
        this._currentRunDeferreds = [];
        
        // re-schedule if we got a schedule call when we were running
        if (this.scheduled) {
          this._log(
            `scheduled to run again, will run in ${ this.timeout }ms.`
          );
          
          // in that case, schedule another run after the timeout
          setTimeout(this._start.bind(this), this.timeout);
        }
      });
  } // #_start
} // Scheduler