import { Logger } from '../../lib/metalogger/Logger';

global.LOGGER = new Logger({
  notifTitle: 'nrser tests',
});

global.METALOG = LOGGER.log.bind(LOGGER);
