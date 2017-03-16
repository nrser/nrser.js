const gulp = require('gulp');
const sh = require('shelljs');

const libUgh = require('@nrser/ugh');

const ugh = new libUgh.Ugh({gulp, packageDir: __dirname});

ugh.autoTasks();

// ESDoc generation
ugh.task(libUgh.EsdocTask, {
  id: 'src',
});

module.exports = ugh;
