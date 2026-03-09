import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { UnregisterTokenDto } from './dto/unregister-token.dto';

jest.mock('expo-server-sdk', () => {
  function MockExpo() {
    return {};
  }
  MockExpo.isExpoPushToken = () => true;
  return { __esModule: true, default: MockExpo };
});

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            registerToken: jest.fn(),
            unregisterToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('registerToken', () => {
    it('calls service with userId and token, returns { data: null }', async () => {
      const req = { userId: 'user-1' };
      const dto = { token: 'ExponentPushToken[abc123]' };

      const result = await controller.registerToken(dto, req);

      expect(service.registerToken).toHaveBeenCalledWith('user-1', 'ExponentPushToken[abc123]');
      expect(result).toEqual({ data: null });
    });
  });

  describe('unregisterToken', () => {
    it('calls service with userId and token, returns { data: null }', async () => {
      const req = { userId: 'user-1' };
      const dto = { token: 'ExponentPushToken[abc123]' };

      const result = await controller.unregisterToken(dto, req);

      expect(service.unregisterToken).toHaveBeenCalledWith('user-1', 'ExponentPushToken[abc123]');
      expect(result).toEqual({ data: null });
    });
  });

  describe('RegisterTokenDto validation', () => {
    const validToken = 'ExponentPushToken[abcdefghij1234567890]';

    it('accepts a valid Expo push token', async () => {
      const dto = plainToInstance(RegisterTokenDto, { token: validToken });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects token exceeding MaxLength(100)', async () => {
      const longContent = 'a'.repeat(80);
      const dto = plainToInstance(RegisterTokenDto, {
        token: `ExponentPushToken[${longContent}]`,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects token with invalid format (no ExponentPushToken prefix)', async () => {
      const dto = plainToInstance(RegisterTokenDto, { token: 'InvalidToken[abc123]' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects token with special characters inside brackets', async () => {
      const dto = plainToInstance(RegisterTokenDto, {
        token: 'ExponentPushToken[abc<script>alert(1)</script>]',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects empty token', async () => {
      const dto = plainToInstance(RegisterTokenDto, { token: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects token with content too short inside brackets', async () => {
      const dto = plainToInstance(RegisterTokenDto, { token: 'ExponentPushToken[short]' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UnregisterTokenDto validation', () => {
    const validToken = 'ExponentPushToken[abcdefghij1234567890]';

    it('accepts a valid Expo push token', async () => {
      const dto = plainToInstance(UnregisterTokenDto, { token: validToken });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects token with invalid format', async () => {
      const dto = plainToInstance(UnregisterTokenDto, { token: 'not-a-valid-token' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects token exceeding MaxLength(100)', async () => {
      const longContent = 'a'.repeat(80);
      const dto = plainToInstance(UnregisterTokenDto, {
        token: `ExponentPushToken[${longContent}]`,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
