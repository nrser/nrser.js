// system
import path from 'path';

// deps
import _ from 'lodash';
import chai, { expect } from 'chai';

// package
import { itMaps2 } from '../../../lib/testing';
import { cmd } from '../../../lib/script';
import {
  Ugh,
} from '../../../lib/ugh';

export const PROJECT_ROOT = path.normalize(
  path.join(
    __dirname, // /test/lib/ugh
    '..', // /test/lib
    '..', // /test
    '..' // /
  )
);

// function clean() {
//   cmd.
// }
  