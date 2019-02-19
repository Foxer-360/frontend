/**
 * Useful class for coloring text in console output
 */
export class Colors {

  public static Backgrounds = {
    Black: '\x1b[40m',
    Red: '\x1b[41m',
    Green: '\x1b[42m',
    Yellow: '\x1b[43m',
    Blue: '\x1b[44m',
    Magenta: '\x1b[45m',
    Cyan: '\x1b[46m',
    White: '\x1b[47m',
  };

  public static Foregrounds = {
    Black: '\x1b[30m',
    Red: '\x1b[31m',
    Green: '\x1b[32m',
    Yellow: '\x1b[33m',
    Blue: '\x1b[34m',
    Magenta: '\x1b[35m',
    Cyan: '\x1b[36m',
    White: '\x1b[37m',
  };

  public static System = {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',
  };

  public static bright(text: string) {
    return Colors.System.Bright + text + Colors.System.Reset;
  }

  public static green(text: string) {
    return Colors.Foregrounds.Green + text + Colors.System.Reset;
  }

  public static red(text: string) {
    return Colors.Foregrounds.Red + text + Colors.System.Reset;
  }

  public static blue(text: string) {
    return Colors.Foregrounds.Blue + text + Colors.System.Reset;
  }

  public static black(text: string) {
    return Colors.Foregrounds.Black + text + Colors.System.Reset;
  }

  public static yellow(text: string) {
    return Colors.Foregrounds.Yellow + text + Colors.System.Reset;
  }

  public static magenta(text: string) {
    return Colors.Foregrounds.Magenta + text + Colors.System.Reset;
  }

  public static cyan(text: string) {
    return Colors.Foregrounds.Cyan + text + Colors.System.Reset;
  }

  public static white(text: string) {
    return Colors.Foregrounds.White + text + Colors.System.Reset;
  }

}