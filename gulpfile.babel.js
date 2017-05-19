import gulp from 'gulp';

import {
  Ugh,
  // ESDocTask,
  EsdocTask,
} from '@nrser/ugh';

const ugh = new Ugh({gulp, packageDir: __dirname});

ugh.autoTasks();

// ESDoc generation
ugh.task(EsdocTask, {
  id: 'src',
});

// export default ugh;
module.exports = ugh;