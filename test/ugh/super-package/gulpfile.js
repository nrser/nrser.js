const gulp = require('gulp');
const Ugh = require('../../lib/ugh').Ugh;

const ugh = new Ugh({packageDir: __dirname, gulp});

ugh.include('../..');
