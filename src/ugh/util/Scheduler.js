export class Scheduler {
  /**
  * flag set to true when scheduled to run.
  */
  scheduled: boolean;
  
  /**
  * flag set to true when the operation is running
  */
  running: boolean;
  
  /**
  * name used when logging
  */
  name: string;
  
  /**
  * function to run.
  */
  run: Function;
  
  /**
  * ms to wait after a change to run
  */
  timeout: number;
  
  /**
  * if true, will log to console. if a function will call that with
  * log messages.
  */
  log: boolean | Function;
  
  constructor(
    name,
    run,
    {
      timeout = 300,
      log = false,
    } = {}
  ) {
    this.name = name;
    this.scheduled = false;
    this.running = false;
    this.timeout = timeout;
    this.log = log
    this.run = run;
  }
  
  // public API
  // ==========
  
  /**
  * call to schedule a run.
  */
  schedule(): boolean {
    this._log("scheduling...");
    
    // don't do anything if it's already scheduled
    if (this.scheduled) {
      this._log("already scheduled.");
      
      return false;
    }
    
    // flag as scheduled
    this.scheduled = true;
    
    if (this.running) {
      this._log("already running, will re-schedule when done.");
      return false;
    }
    
    this._log(`scheduling run in ${ this.timeout }ms.`);
    setTimeout(this._start.bind(this), this.timeout);
    
    return true;
  }
  
  // private API
  // ===========
  
  /**
  * log a message if `log` is not false.
  */
  _log(...messages): void {
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
    this.running = true;
    
    // unset the scheduled flag
    this.scheduled = false;
    
    // start the operation, providing {#done} as a callback for it to fire
    // when it's complete
    this.run(this._done.bind(this));
  }
  
  _done(): void {
    this._log("run complete.");
    
    // unset the running flag
    this.running = false;
    
    // if we're scheduled, it happen while we were running
    if (this.scheduled) {
      this._log(`scheduled to run again, will run in ${ this.timeout }ms.`);
      
      // in that case, schedule another run after the timeout
      setTimeout(this._start.bind(this), this.timeout);
    }
  }
} // Scheduler