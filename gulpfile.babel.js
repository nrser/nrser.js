import gulp from 'gulp';
import { GulpTasks } from './src/gulpTasks';

import oldGulpTasks from './dev/ref/gulpTasks';

oldGulpTasks(gulp);

const gulpTasks = new GulpTasks(gulp);

