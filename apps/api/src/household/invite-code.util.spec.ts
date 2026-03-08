import { generateInviteCode, isValidInviteCodeFormat, INVITE_CODE_LENGTH } from './invite-code.util';

describe('generateInviteCode', () => {
  it('should generate a 12-character uppercase hex string', () => {
    const code = generateInviteCode();

    expect(code).toHaveLength(INVITE_CODE_LENGTH);
    expect(code).toMatch(/^[A-F0-9]{12}$/);
  });

  it('should generate unique codes on each call', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));

    expect(codes.size).toBe(100);
  });

  it('should only contain uppercase characters', () => {
    const code = generateInviteCode();

    expect(code).toBe(code.toUpperCase());
  });
});

describe('isValidInviteCodeFormat', () => {
  it('should accept valid 12-char hex codes', () => {
    expect(isValidInviteCodeFormat('ABCDEF123456')).toBe(true);
  });

  it('should accept legacy 8-char hex codes', () => {
    expect(isValidInviteCodeFormat('ABCD1234')).toBe(true);
  });

  it('should reject codes shorter than 8 chars', () => {
    expect(isValidInviteCodeFormat('ABC1234')).toBe(false);
  });

  it('should reject codes longer than 12 chars', () => {
    expect(isValidInviteCodeFormat('ABCDEF1234567')).toBe(false);
  });

  it('should reject codes with non-hex characters', () => {
    expect(isValidInviteCodeFormat('GHIJKLMN')).toBe(false);
    expect(isValidInviteCodeFormat('abcd1234')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isValidInviteCodeFormat('')).toBe(false);
  });
});

describe('INVITE_CODE_LENGTH', () => {
  it('should be 12', () => {
    expect(INVITE_CODE_LENGTH).toBe(12);
  });
});
