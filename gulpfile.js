const gulp = require('gulp');
const Ugh = require('./lib/ugh').Ugh;

const ugh = new Ugh(gulp);

ugh.autoTasks();
