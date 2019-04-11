import { Colors } from './colors';
import { logger } from './logger';

let _cacheLock = false;
const _lockMessage = `${Colors.magenta(Colors.bright('[Apollo Cache]'))} ${Colors.magenta('Locked for current request...')}`;
const _unlockMessage = `${Colors.magenta(Colors.bright('[Apollo Cache]'))} ${Colors.magenta('Unlocked for others...')}`;
const _lockTryInterval = { min: 1, max: 5 };

/**
 * Helper function which shows logs into console
 */
const log = (...args) => {
  logger.enable();
  // tslint:disable-next-line:no-console
  console.log(...args);
  logger.disable();
};

/**
 * Simple function which returns integer in given interval <min, max>
 *
 * @param {number} min
 * @param {number} max
 * @return {interger}
 */
const getRandomTime = (min: number, max: number) => {
  return min + Math.floor(Math.random() * (max - min + 1));
};

/**
 * This method tries to lock cache, if it's not possible, then wait for
 * random time and try it again
 *
 * @param {() => void} resolve callback which is called after lock
 */
const _tryToLock = (resolve) => {
  if (!_cacheLock) {
    log(_lockMessage);
    _cacheLock = true;
    resolve();
    return;
  }

  const delayms = getRandomTime(_lockTryInterval.min, _lockTryInterval.max);
  setTimeout(() => {
    _tryToLock(resolve);
  }, delayms);
};

/**
 * This function lock cache.
 *
 * @return {Promise} resolve after lock
 */
const lockCacheRW = async () => {
  if (!_cacheLock) {
    log(_lockMessage);
    _cacheLock = true;
    return Promise.resolve();
  }

  // Waiting process
  return new Promise((res) => {
    _tryToLock(res);
  });
};

/**
 * This function unlock cache.
 */
const unlockCacheRW = () => {
  log(_unlockMessage);
  _cacheLock = false;
};

export {
  lockCacheRW,
  unlockCacheRW,
};
