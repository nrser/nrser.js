import {
  Ugh,
  ESDocTask,
} from '@nrser/ugh';

const ugh = new Ugh({packageDir: __dirname});

ugh.autoTasks();

// ESDoc generation
ugh.task(ESDocTask, {
  id: 'src',
  config: {
    configPath: 'config/esdoc.js',
  },
  clean: false,
});

export default ugh;