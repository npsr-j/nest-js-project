import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  private algorithm = 'aes-256-ctr';

  encrypt(payload: string): { data1: string; data2: string } {
    const key = crypto.randomBytes(32); // AES-256
    const iv = crypto.randomBytes(16); // 16-byte IV

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encryptedAesKey = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    const encryptedPayload = encryptedAesKey.toString('base64');

    // Combine key + iv into one buffer
    const keyIv = Buffer.concat([key, iv]); // 32 + 16 = 48 bytes

    const publicKey = this.configService.get<string>('PUBLIC_KEY');
    if (!publicKey) {
      throw new Error('Public key not found in config');
    }

    const encryptedKeyIv = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      keyIv,
    ).toString('base64');

    return {
      data1: encryptedKeyIv,
      data2: encryptedPayload,
    };
  }

  decrypt(data1: string, data2: string): string {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('Private key not found in config');
    }

    const decryptedKeyIv = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(data1, 'base64'),
    );

    const key = decryptedKeyIv.slice(0, 32);
    const iv = decryptedKeyIv.slice(32, 48);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    const decryptedPayload = Buffer.concat([
      decipher.update(Buffer.from(data2, 'base64')),
      decipher.final(),
    ]);
    return decryptedPayload.toString('utf8');
  }
}
