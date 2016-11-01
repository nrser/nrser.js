// @flow

// system
import path from 'path';

// deps
import _ from 'lodash';
import gaze, { Gaze } from 'gaze';

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
  start(onDone?: DoneCallback) {
    throw new errors.NotImplementedError();
  } // #start
  
  /**
  * just runs `start()`.`
  */
  run(onDone?: DoneCallback): void {
    this.start(onDone);
  }
  
  /**
  * stops watching.
  */
  stop(): void {
    throw new errors.NotImplementedError();
  } // #stop
}