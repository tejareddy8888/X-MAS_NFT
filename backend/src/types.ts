import { ApiProperty } from '@nestjs/swagger';

export class NftDto {
  @ApiProperty({ type: 'string' })
  address: string;
  @ApiProperty({ type: 'string' })
  ipfsCid: string;
}

export class ipfsBlob {
  path: string;
  content: ArrayBuffer;
}

export class AddressDto {
  @ApiProperty({ type: 'string' })
  address: string;
}

export class StarDetailsDto {
  @ApiProperty({ type: 'string' })
  address: string;
  @ApiProperty({ type: 'string' })
  starDetails: string;
}

export class NftTokenDetails {
  @ApiProperty({ type: 'string' })
  tokenID: string;
  @ApiProperty({ type: 'string' })
  ipfsURL: string;
}
