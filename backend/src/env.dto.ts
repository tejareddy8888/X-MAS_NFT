import { IsNotEmpty, IsString, ValidateIf, IsUrl } from 'class-validator';

export class EnvDto {
  @IsUrl({
    require_tld: false,
    protocols: ['http', 'https', 'ws', 'wss'],
  })
  @IsNotEmpty()
  NETWORK_URL: string;

  @ValidateIf((object) => !object.ADMIN_PRIVATEKEY || object.ADMIN_MNEMONIC)
  @IsNotEmpty()
  @IsString()
  ADMIN_MNEMONIC: string;

  @ValidateIf((object) => !object.ADMIN_MNEMONIC || object.ADMIN_PRIVATEKEY)
  @IsNotEmpty()
  @IsString()
  ADMIN_PRIVATEKEY: string;
}
