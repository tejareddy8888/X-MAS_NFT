import { LoggerService } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';

import _ from 'lodash';
import { Format } from 'logform';
import * as winston from 'winston';

export enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
  verbose = 'verbose',
}

const { format } = winston;

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'magenta',
  verbose: 'grey',
});

export class NFTLogger implements LoggerService {
  private readonly context: string;
  private readonly logger: winston.Logger;

  constructor(context = 'System') {
    this.context = context;

    const loggerFormat = format.combine(
      format.timestamp({ format: 'MM/DD/YYYY, HH:mm:ss' }),
      this.getFormat(),
    );

    this.logger = winston.createLogger({
      format: loggerFormat,
      levels: {
        [LogLevel.error]: 0,
        [LogLevel.warn]: 1,
        [LogLevel.info]: 2,
        [LogLevel.debug]: 3,
        [LogLevel.verbose]: 4,
      },
      level: LogLevel[process.env.APP_LOGLEVEL] || LogLevel.debug,
      transports: [new winston.transports.Console()],
    });
  }

  public info(message: string, meta?: string | Record<string, any>): void {
    this.callMethod('info', message, meta);
  }

  public error(
    error: string | Error,
    meta?: string | Record<string, any> | Error,
    context?: string,
  ): void {
    if (error instanceof Error) {
      if (isObject(error.message)) {
        error.message = JSON.stringify(error.message);
      }
      this.logger.error(error.message, { context, stack: error.stack, meta });
      return;
    }

    const errorMeta: any = {};
    if (meta) {
      if (typeof meta === 'string') {
        errorMeta.stack = meta;
      } else if (meta instanceof Error) {
        if (isObject(meta.message)) {
          meta.message = JSON.stringify(meta.message);
        }
        errorMeta.stack = meta.stack;
      } else {
        errorMeta.meta = meta;
      }
    }

    this.logger.error(error, { context: this.context, ...errorMeta });
  }

  public warn(
    message: string | Record<string, any> | [],
    meta?: string | Record<string, any>,
  ): void {
    this.callMethod('warn', message, meta);
  }

  public debug(
    message: string | Record<string, any> | [],
    meta?: string | Record<string, any>,
  ): void {
    this.callMethod('debug', message, meta);
  }

  public verbose(
    message: string | Record<string, any> | [],
    meta?: string | Record<string, any>,
  ): void {
    this.callMethod('verbose', message, meta);
  }

  public log(
    message: string | Record<string, any> | [],
    meta?: string | Record<string, any>,
  ): void {
    this.callMethod('info', message, meta);
  }

  private callMethod(
    method: string,
    message: string | Record<string, any> | [],
    meta?: string | Record<string, any>,
  ): void {
    if (typeof meta === 'string') {
      this.logger[method as keyof winston.Logger](message, { context: meta });
      return;
    }
    if (meta !== null && typeof meta === 'object') {
      this.logger[method as keyof winston.Logger](message, {
        context: this.context,
        meta,
      });
      return;
    }
    this.logger[method as keyof winston.Logger](message, {
      context: this.context,
    });
  }

  private getFormat(): Format {
    return format.printf(
      ({ level, message, timestamp, context, stack, meta }) => {
        const labelString = format
          .colorize()
          .colorize(LogLevel.warn, `[${context || this.context}]`);
        const prefixString = format
          .colorize()
          .colorize(level, `[${level.toUpperCase()}] ${process.pid} - `);
        const messageString = format.colorize().colorize(level, message);
        let formatted = `${prefixString} ${timestamp}   ${labelString} ${messageString}`;
        let prettyMeta;
        if (stack) {
          formatted += `\n${format.colorize().colorize(level, stack)}`;
        }
        if (meta && !_.isEmpty(meta)) {
          prettyMeta = `meta: ${JSON.stringify(meta)}`;
          formatted += `\n${format.colorize().colorize(level, prettyMeta)}`;
        }
        return formatted;
      },
    );
  }
}
