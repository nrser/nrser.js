import {
  Ugh,
  ESDocTask,
} from '@nrser/ugh';

import getBabelOptions from './config/getBabelOptions';

const ugh = new Ugh({
  packageDir: __dirname,
  
  config: {
    tasks: {
      Babel: {
        options: getBabelOptions('node'),
      },
    },
  },
});

ugh.autoTasks();

// ESDoc generation
ugh.task({
  type: ESDocTask,
  id: 'src',
  configPath: 'config/esdoc.js',
});

export default ugh;