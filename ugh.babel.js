import {
  Ugh,
  ESDocTask,
} from '@nrser/ugh';

const ugh = new Ugh({packageDir: __dirname});

ugh.autoTasks();

// ESDoc generation
ugh.task({
  type: ESDocTask,
  id: 'src',
  configPath: 'config/esdoc.js',
});

export default ugh;