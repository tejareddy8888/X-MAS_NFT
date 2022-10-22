import { ApiProperty } from '@nestjs/swagger';

export class NftDto {
  @ApiProperty({ type: 'string' })
  address: string;
  @ApiProperty({ type: 'string' })
  tokenText: string;
}

export class ipfsBlob {
  path: string;
  content: string;
}

export class AddressDto {
  @ApiProperty({ type: 'string' })
  address: string;
}
