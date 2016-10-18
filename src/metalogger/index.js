import { Logger } from './Logger';

export const DEFAULT_LOGGER = new Logger();

if (!global.METALOG) {
  global.METALOG = DEFAULT_LOGGER.log.bind(DEFAULT_LOGGER);
}

export * from './Level';
export * from './LevelSpec';
export * from './Logger';

