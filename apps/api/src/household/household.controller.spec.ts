import { Test, TestingModule } from '@nestjs/testing';
import { HouseholdController } from './household.controller';
import { HouseholdService } from './household.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';
import { SupabaseService } from '../supabase/supabase.service';

const mockHouseholdService = {
  create: jest.fn(),
  findMembers: jest.fn(),
  leave: jest.fn(),
  joinByInviteCode: jest.fn(),
};

describe('HouseholdController', () => {
  let controller: HouseholdController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HouseholdController],
      providers: [
        { provide: HouseholdService, useValue: mockHouseholdService },
        { provide: SupabaseService, useValue: { getClient: jest.fn() } },
      ],
    })
      .overrideGuard(HouseholdMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<HouseholdController>(HouseholdController);
  });

  describe('create', () => {
    it('should return { data: household } when valid data is provided', async () => {
      const household = { id: 'h-1', name: 'Casa', inviteCode: 'ABC123', createdAt: '2026-01-01' };
      mockHouseholdService.create.mockResolvedValue(household);

      const result = await controller.create(
        { name: 'Casa' },
        { userId: 'user-1' },
      );

      expect(result).toEqual({ data: household });
      expect(mockHouseholdService.create).toHaveBeenCalledWith('user-1', 'Casa');
    });

    it('should propagate service errors', async () => {
      mockHouseholdService.create.mockRejectedValue(new Error('Insert failed'));

      await expect(
        controller.create({ name: 'Casa' }, { userId: 'user-1' }),
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('getMembers', () => {
    it('should return { data: members } when household exists', async () => {
      const members = [
        { id: 'm-1', userId: 'user-1', displayName: 'Alice', role: 'owner' },
      ];
      mockHouseholdService.findMembers.mockResolvedValue(members);

      const result = await controller.getMembers('h-1');

      expect(result).toEqual({ data: members });
      expect(mockHouseholdService.findMembers).toHaveBeenCalledWith('h-1');
    });

    it('should propagate service errors', async () => {
      mockHouseholdService.findMembers.mockRejectedValue(new Error('Query failed'));

      await expect(controller.getMembers('h-1')).rejects.toThrow('Query failed');
    });
  });

  describe('leave', () => {
    it('should return deleted message when last member leaves', async () => {
      mockHouseholdService.leave.mockResolvedValue({ deleted: true });

      const result = await controller.leave('h-1', { userId: 'user-1' });

      expect(result).toEqual({
        data: {
          householdDeleted: true,
          message: 'Household deleted (last member)',
        },
      });
      expect(mockHouseholdService.leave).toHaveBeenCalledWith('user-1', 'h-1');
    });

    it('should return left message when member leaves', async () => {
      mockHouseholdService.leave.mockResolvedValue({ deleted: false });

      const result = await controller.leave('h-1', { userId: 'user-2' });

      expect(result).toEqual({
        data: {
          householdDeleted: false,
          message: 'Successfully left household',
        },
      });
    });

    it('should propagate ForbiddenException when owner tries to leave', async () => {
      mockHouseholdService.leave.mockRejectedValue(
        new ForbiddenException('Owner cannot leave'),
      );

      await expect(
        controller.leave('h-1', { userId: 'user-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('join', () => {
    it('should return { data: household } when valid invite code is provided', async () => {
      const household = { id: 'h-1', name: 'Casa', inviteCode: 'ABC123', createdAt: '2026-01-01' };
      mockHouseholdService.joinByInviteCode.mockResolvedValue(household);

      const result = await controller.join(
        { inviteCode: 'ABC123', displayName: 'Bob' },
        { userId: 'user-2' },
      );

      expect(result).toEqual({ data: household });
      expect(mockHouseholdService.joinByInviteCode).toHaveBeenCalledWith(
        'user-2',
        'ABC123',
        'Bob',
      );
    });

    it('should propagate NotFoundException when invite code is invalid', async () => {
      mockHouseholdService.joinByInviteCode.mockRejectedValue(
        new NotFoundException('Invalid invite code'),
      );

      await expect(
        controller.join(
          { inviteCode: 'BADCODE', displayName: 'Bob' },
          { userId: 'user-2' },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
