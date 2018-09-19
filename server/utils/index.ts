'use strict';

/**
 * The simple function that clear whole terminal. It's useful when you run the
 * server, then you clear console and show information which matters.
 *
 * @return {void}
 */
const clearTerminal = () => {
  // process.stdout.write('\x1Bc');
  // // tslint:disable-next-line:no-console
  // console.log('\x1Bc');

  process.stdout.write('\x1B[2J\x1B[0f\u001b[0;0H');
};

export {
  clearTerminal,
};
