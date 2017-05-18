// Imports
// ==========================================================================

// deps
import 'source-map-support/register';

import { _ } from 'nrser';
import chai, { expect } from 'chai';

// package
import * as Path from 'nrser/lib/path';
import { Logger } from 'nrser/lib/metalogger';


// Config
// ==========================================================================

// configure metalogger
global.LOGGER = new Logger({
  notifTitle: 'nrser tests',
});

global.METALOG = LOGGER.log.bind(LOGGER);


// Exports
// ==========================================================================

// re-exports
export chai, { expect } from 'chai';

// TODO module resolve doesn't work!
// export * from 'nrser/lib/testing';
export * from '../../lib/testing';
// export { Promise, _ } from 'nrser';
export { Promise, _ } from '../../lib';

export * as path from 'nrser/lib/path';

export * as NRSER from 'nrser';
export * as nrser from 'nrser';

export t from 'tcomb';

// TODO module resolver doesn't work:
// export * from '//config/Paths';
export * from '../../config/Paths';

