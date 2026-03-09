import { randomBytes } from 'node:crypto';

const INVITE_CODE_BYTES = 6;
const INVITE_CODE_LENGTH = INVITE_CODE_BYTES * 2; // 12 hex chars

export function generateInviteCode(): string {
  return randomBytes(INVITE_CODE_BYTES).toString('hex').toUpperCase();
}

export function isValidInviteCodeFormat(code: string): boolean {
  return /^[A-F0-9]{8,12}$/.test(code);
}

export { INVITE_CODE_LENGTH };
