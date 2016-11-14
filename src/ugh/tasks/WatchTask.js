// @flow

// system
import path from 'path';

// deps
import _ from 'lodash';
import Promise from 'bluebird';

// nrser
import * as errors from '../../errors';

// ugh
import { Ugh } from '../Ugh';
import { Task } from './Task';
import { findOnly } from '../../collection';
import { Pattern } from '../util/Pattern';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  DoneCallback,
  GazeEvent,
  RelPath,
} from '../types';

/**
* base class for tasks that watch things and run in response.
*/
export class WatchTask extends Task { 
  /**
  * starts watching.
  */
  start(): Promise<void> {
    throw new errors.NotImplementedError();
  } // #start
  
  /**
  * just calls `start()`.`
  */
  execute(): Promise<void> {
    return this.start();
  }
  
  /**
  * stops watching.
  */
  stop(): void {
    throw new errors.NotImplementedError();
  } // #stop
}