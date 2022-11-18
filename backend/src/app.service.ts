import { Injectable } from '@nestjs/common';
import { validateSync, ValidationError } from 'class-validator';
import { EnvDto } from './env.dto';

@Injectable()
export class AppService {
  configuration: EnvDto;
  constructor() {
    const configuration = new EnvDto();
    Object.assign(configuration, { ...process.env });

    const validationResult = validateSync(configuration, { whitelist: true });
    if (validationResult && validationResult.length > 0) {
      console.error(
        'Invalid configuration',
        `Validation errors:\n${this.extractValidationErrorMessages(
          validationResult,
        )}`,
      );
      throw new Error('Invalid configuration');
    }

    this.configuration = configuration;
  }

  extractValidationErrorMessages(validationErrors: ValidationError[]): string {
    return validationErrors
      .map(
        (validationError) =>
          `${Object.values(validationError.constraints)
            .map((constraint) => `  * ${constraint}.`)
            .join('\n')}`,
      )
      .join('.\n');
  }
  getHello(): string {
    return 'UZH NFT BACKEND';
  }
}
