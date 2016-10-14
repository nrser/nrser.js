const gulp = require('gulp');
const Ugh = require('./lib/ugh').Ugh;

const ugh = new Ugh(gulp);

ugh.autoTasks();

// ugh.less({
//   name: 'index',
//   src: 'src/ui/index.less',
//   dest: 'public/css/index.css',
// });
