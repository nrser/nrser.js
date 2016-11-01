// @flow

// deps
import _ from 'lodash';
import Q from 'q';

// package
import { Pattern } from '../util';
import { Task } from './Task';
import { BuildTask } from './BuildTask';
import { CleanTask } from './CleanTask';
import { WatchWebpackTask } from './WatchWebpackTask';
import { Ugh } from '../Ugh';

// types
import type {
  TaskId,
  TaskName,
  AbsDir,
  WebpackConfig,
  WebpackCompiler,
  WebpackStats,
} from '../types';

export class WebpackTask extends BuildTask {
  /**
  * webpack config
  */
  config: WebpackConfig;
  
  /**
  * the compiler instance
  */
  compiler: WebpackCompiler;
  
  static create({ugh, id, config, watch = true}: {
    ugh: Ugh,
    id: TaskId,
    config: WebpackConfig,
    watch: boolean,
  }): WebpackTest {
    const webpackTask = new this({ugh, id, config});
    
    ugh.add(webpackTask);
    
    if (watch) {
      WatchWebpackTask.create({
        ugh,
        webpackTask,
      });
    }
    
    return webpackTask;
  }
  
  constructor({ugh, id, config}: {
    ugh: Ugh,
    id: TaskId,
    config: WebpackConfig,
  }) {
    super({ugh, id});
    
    const webpack = require('webpack');
    
    this.config = config;
    this.compiler = webpack(this.config);
  }
  
  /**
  * depend on all build tasks that are not webpack tasks.
  */
  deps(): Array<BuildTask> {
    return _.filter(this.ugh.tasks, (task): boolean => {
      return (
        (task instanceof BuildTask) && 
        !(task instanceof WebpackTask)
      );
    });
  }
  
  /**
  * do the webpack build
  */
  execute(): Promise<void> {
    const webpack = require('webpack');
    
    return Q.ninvoke(this.compiler, 'run')
      .then((stats: WebpackStats) => {
        this.log("successfully bundled\n", stats.toString({
          colors: true,
          // hash: false,
          version: false,
          // timings: false,
          // assets: false,
          chunks: false,
          // modules: false,
          // reasons: false,
          // children: false,
          // source: false,
          // errors: false,
          // errorDetails: false,
          // warnings: false,
          // publicPath: false
        }));
        
        this.notify('BUNDLED');
      })
      .catch((error: Error) => {
        this.logError(error);
        throw error;
      });
  }
}