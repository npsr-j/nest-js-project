import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DataResponse, DecryptData, EncryptData } from './models/api-property.model';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/get-encrypt-data')
  @ApiResponse({ status: 200, description: 'Encrypted' })
  encryptData(@Body() data: EncryptData): DataResponse<DecryptData> {
    if (!data.payload || data.payload.length > 2000) {
      return { successful: false, error_code: 'INVALID_PAYLOAD', data: null };
    }

    try {
      const result = this.appService.encrypt(data.payload);
      return { successful: true, error_code: '', data: result };
    } catch (err) {
      console.error('[ENCRYPTION ERROR]', err.message);
      return { successful: false, error_code: 'ENCRYPTION_FAILED', data: null };
    }
  }

  @Post('/get-decrypt-data')
  @ApiResponse({ status: 200, description: 'Decrypted' })
  decryptData(@Body() data: DecryptData): DataResponse<EncryptData> {
    if (!data.data1 || !data.data2) {
      return { successful: false, error_code: 'INVALID_DATA', data: null };
    }

    try {
      const payload = this.appService.decrypt(data.data1, data.data2);
      return { successful: true, error_code: '', data: { payload } };
    } catch (err) {
      console.error('[DECRYPTION ERROR]', err.message);
      return { successful: false, error_code: 'DECRYPTION_FAILED', data: null };
    }
  }
}
