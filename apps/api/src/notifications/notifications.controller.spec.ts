import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

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
});
