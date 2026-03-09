import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({ from: jest.fn() }),
}));

import { createClient } from '@supabase/supabase-js';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue({ from: jest.fn() });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
              if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-role-key';
              throw new Error(`Unknown key: ${key}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should create supabase client with correct config values', () => {
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-role-key',
    );
  });

  it('should return the supabase client via getClient', () => {
    const client = service.getClient();

    expect(client).toBeDefined();
    expect(client).toHaveProperty('from');
  });

  it('should throw when SUPABASE_URL is missing', async () => {
    (createClient as jest.Mock).mockClear();

    await expect(
      Test.createTestingModule({
        providers: [
          SupabaseService,
          {
            provide: ConfigService,
            useValue: {
              getOrThrow: jest.fn((key: string) => {
                if (key === 'SUPABASE_URL') throw new Error('Missing SUPABASE_URL');
                return 'value';
              }),
            },
          },
        ],
      }).compile(),
    ).rejects.toThrow('Missing SUPABASE_URL');
  });

  it('should throw when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    (createClient as jest.Mock).mockClear();

    await expect(
      Test.createTestingModule({
        providers: [
          SupabaseService,
          {
            provide: ConfigService,
            useValue: {
              getOrThrow: jest.fn((key: string) => {
                if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
                if (key === 'SUPABASE_SERVICE_ROLE_KEY')
                  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
                return 'value';
              }),
            },
          },
        ],
      }).compile(),
    ).rejects.toThrow('Missing SUPABASE_SERVICE_ROLE_KEY');
  });
});
