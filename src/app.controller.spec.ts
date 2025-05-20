import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { generateKeyPairSync } from 'crypto';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let configService: ConfigService;
  let mockRsaKey: { publicKey: string; privateKey: string };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, ConfigService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    configService = app.get<ConfigService>(ConfigService);

    mockRsaKey = generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('encryption', () => {
    it('should return encrypted data', () => {
      // mock `this.configService.get<string>('PUBLIC_KEY')`
      jest.spyOn(configService, 'get').mockImplementation(() => mockRsaKey.publicKey);

      const payload = { payload: 'test data' };
      const result = appController.encryptData(payload);
      expect(result).toHaveProperty('successful', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('data1');
      expect(result.data).toHaveProperty('data2');
    });

    it('should return error for invalid payload', () => {
      // mock `this.configService.get<string>('PUBLIC_KEY')`
      jest.spyOn(configService, 'get').mockImplementation(() => mockRsaKey.publicKey);

      const payload = { payload: '' };
      const result = appController.encryptData(payload);
      expect(result).toHaveProperty('successful', false);
      expect(result).toHaveProperty('error_code', 'INVALID_PAYLOAD');
    });

    it('should return error for payload too long', () => {
      // mock `this.configService.get<string>('PUBLIC_KEY')`
      jest.spyOn(configService, 'get').mockImplementation(() => mockRsaKey.publicKey);
      
      const payload = { payload: 'a'.repeat(2001) };
      const result = appController.encryptData(payload);
      expect(result).toHaveProperty('successful', false);
      expect(result).toHaveProperty('error_code', 'INVALID_PAYLOAD');
    });
  })

  describe('decryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const payload = { payload: 'test data' };

      // mock `this.configService.get<string>('PUBLIC_KEY')`
      jest.spyOn(configService, 'get').mockImplementation(() => mockRsaKey.publicKey);
      const encrypted = appController.encryptData(payload);

      // mock `this.configService.get<string>('PRIVATE_KEY')`
      jest.spyOn(configService, 'get').mockImplementation(() => mockRsaKey.privateKey);
      const decrypted = appController.decryptData({ data1: encrypted.data?.data1!, data2: encrypted.data?.data2! });

      expect(decrypted.data?.payload).toBe(payload.payload);
    });

    it('should return error for invalid decryption data', () => {
      // mock `this.configService.get<string>('PRIVATE_KEY')`
      jest.spyOn(configService, 'get').mockImplementation(() => mockRsaKey.privateKey);

      const encryptedData = {
        data1: '',
        data2: '',
      };
      const result = appController.decryptData(encryptedData);
      expect(result).toHaveProperty('successful', false);
      expect(result).toHaveProperty('error_code', 'INVALID_DATA');
    });
  });
});
