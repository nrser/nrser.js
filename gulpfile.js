const gulp = require('gulp');
const _ = require('lodash');

_.each(require('./lib/gulpTasks.js')().tasks, (args) => {
  gulp.task.apply(gulp, args);
});
