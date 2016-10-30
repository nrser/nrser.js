const gulp = require('gulp');
const Ugh = require('../../../lib/ugh').Ugh;

const ugh = new Ugh({gulp, packageDir: __dirname});

ugh.autoTasks();

ugh.include('../../..');

ugh.createGulpTasks();

module.exports = ugh;
