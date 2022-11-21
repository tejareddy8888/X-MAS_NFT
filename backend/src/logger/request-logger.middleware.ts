import { Injectable, NestMiddleware, Request, Response } from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import _ from 'lodash';
import * as moment from 'moment-timezone';

import { NFTLogger } from './logger.service';

const enum LogType {
  REQUEST = 'REQUEST',
  RESPONSE = 'RESPONSE',
  RESPONSE_ERROR = 'RESPONSE_ERROR',
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new NFTLogger('RequestLogger');

  public getResponseTime(startTimestamp: number): string {
    return `${moment(startTimestamp).millisecond()}ms`;
  }

  public getRemoteAddress(req: ExpressRequest): string | undefined {
    return (
      req.ip || (req.connection && req.connection.remoteAddress) || undefined
    );
  }

  public getLogType(type: LogType): string {
    switch (type) {
      case LogType.REQUEST:
        return '-->';
      case LogType.RESPONSE:
      case LogType.RESPONSE_ERROR:
        return '<--';
      default:
        return '---';
    }
  }

  public log(
    type: LogType,
    req: ExpressRequest,
    startTimestamp: number,
    statusCode: number | null = null,
  ): void {
    const logContent = [
      this.getLogType(type),
      req.method,
      req.originalUrl,
      this.getRemoteAddress(req),
    ];

    if (type === LogType.RESPONSE) {
      logContent.push(String(statusCode));
    }

    if (type === LogType.RESPONSE_ERROR) {
      logContent.push('ERROR');
    }

    if (type === LogType.RESPONSE) {
      logContent.push(this.getResponseTime(startTimestamp));
    }

    const reqKeysToLog = [
      'method',
      'url',
      'originalUrl',
      'headers',
      'cookies',
      'params',
      'query',
      'body',
    ];

    let verbose = '';
    for (const key of Object.keys(req)) {
      if (reqKeysToLog.includes(key)) {
        verbose += `${key}: ${JSON.stringify(req[key])} | `;
      }
    }

    this.logger.verbose(verbose);
    this.logger.log(logContent.join(' '));
  }

  public async use(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    next: () => void,
  ): Promise<void> {
    const startTimestamp = Date.now();

    this.log(LogType.REQUEST, req, startTimestamp);

    res.on('finish', () => {
      this.log(LogType.RESPONSE, req, startTimestamp, res.statusCode);
    });

    try {
      await next();
    } catch (error) {
      // log uncaught downstream errors
      const statusCode = error
        ? (error as any).isBoom
          ? (error as any).output.statusCode
          : (error as any).status || 500
        : 404;

      this.log(LogType.RESPONSE_ERROR, req, startTimestamp, statusCode);

      throw error;
    }
  }
}
