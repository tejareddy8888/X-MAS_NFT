import { Injectable } from '@nestjs/common';
import { create, IPFSHTTPClient } from 'ipfs-http-client';

import { ipfsBlob } from 'src/types';

@Injectable()
export class IpfsService {
  protected ipfsClient: IPFSHTTPClient;
  constructor() {
    const projectId = process.env.IPFS_PROJECT_ID;
    const projectSecret = process.env.IPFS_PROJECT_SECRET;
    this.ipfsClient = create({
      url: 'https://ipfs.infura.io:5001',
      headers: {
        authorization:
          'Basic ' +
          Buffer.from(projectId + ':' + projectSecret).toString('base64'),
      },
    });
  }

  async uploadImage(content: ipfsBlob): Promise<string> {
    const response = await this.ipfsClient.add(content, {
      pin: true,
      cidVersion: 1,
    });

    return response.cid.toString();
  }

  async showImage(cid: string): Promise<string> {
    const response = await this.ipfsClient.cat(cid);
    let buffer = Buffer.alloc(0);

    let content = await response[Symbol.asyncIterator]().next();
    while (!content.done && content.value) {
      buffer = Buffer.concat([buffer, content.value]);
      content = await response[Symbol.asyncIterator]().next();
    }

    return buffer.toString();
  }
}
