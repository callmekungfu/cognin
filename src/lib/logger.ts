export enum LogLevel {
  FATAL,
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

export class Logger {
  static logLevel = LogLevel.INFO;
  static error(...message: any) {
    if (this.logLevel > LogLevel.FATAL) {
      return;
    }
    console.error(...message);
  }

  static warn(...message: any) {
    if (this.logLevel > LogLevel.WARN) {
      return;
    }
    console.log(...message);
  }

  static info(...message: any) {
    if (this.logLevel > LogLevel.INFO) {
      return;
    }
    console.log(...message);
  }

  static debug(...message: any) {
    if (this.logLevel > LogLevel.DEBUG) {
      return;
    }
    console.log(...message);
  }
}
