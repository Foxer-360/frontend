export interface ILogger {
  enable: () => void;
  disable: () => void;
}

const logger = (() => {
  const result = {} as ILogger;
  let consoleLogInstance = null;

  result.enable = () => {
    if (consoleLogInstance == null) {
      return;
    }

    console.log = consoleLogInstance;
    consoleLogInstance = null;
  };

  result.disable = () => {
    if (consoleLogInstance !== null) {
      return;
    }

    consoleLogInstance = console.log;
    console.log = () => {
      // Empty dummy function
    };
  };

  return result;
})() as ILogger;

export {
  logger
};
