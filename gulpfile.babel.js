import gulp from 'gulp';
import Ugh from './src/ugh';

const ugh = new Ugh(gulp);

ugh.autoTasks();

// ugh.less({
//   name: 'index',
//   src: 'src/ui/index.less',
//   dest: 'public/css/index.css',
// });
