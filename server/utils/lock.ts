import { Colors } from './colors';
import { logger } from './logger';

let _cacheLock = false;
const _lockMessage = `${Colors.magenta(Colors.bright('[Apollo Cache]'))} ${Colors.magenta('Locked for current request...')}`;
const _unlockMessage = `${Colors.magenta(Colors.bright('[Apollo Cache]'))} ${Colors.magenta('Unlocked for others...')}`;
const _lockTryInterval = { min: 1, max: 5 };
const _unlockFrozenMessage = `${Colors.magenta(Colors.bright('[Apollo Cache]'))} ${Colors.magenta('Lock is frozen! Unlocking for others...')}`;
const _maxLockTime = 2000;

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
const _tryToLock = (resolve: (timer: NodeJS.Timeout) => void) => {
  if (!_cacheLock) {
    log(_lockMessage);
    _cacheLock = true;
    const timer = setTimeout(() => {
      _cacheLock = false;
      log(_unlockFrozenMessage);
    }, _maxLockTime);
    resolve(timer);
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
const lockCacheRW = async (): Promise<NodeJS.Timeout> => {
  if (!_cacheLock) {
    log(_lockMessage);
    _cacheLock = true;
    const timer = setTimeout(() => {
      _cacheLock = false;
      log(_unlockFrozenMessage);
    }, _maxLockTime);
    return Promise.resolve(timer);
  }

  // Waiting process
  return new Promise((res: (timer: NodeJS.Timeout) => void) => {
    _tryToLock(res);
  });
};

/**
 * This function unlock cache.
 */
const unlockCacheRW = (timer?: NodeJS.Timeout) => {
  log(_unlockMessage);
  _cacheLock = false;
  if (timer) {
    clearTimeout(timer);
  }
};

export {
  lockCacheRW,
  unlockCacheRW,
};
