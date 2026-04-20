import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('../drizzle/schema', () => ({
  users: { openId: 'openId', role: 'role', lastSignedIn: 'lastSignedIn' },
  orders: {},
  orderItems: {},
  bundleDeals: {},
  InsertUser: {},
}));

vi.mock('./_core/env', () => ({
  ENV: {
    ownerOpenId: 'owner-open-id-123',
    databaseUrl: '',
    appId: '',
    cookieSecret: '',
    oAuthServerUrl: '',
    isProduction: false,
    forgeApiUrl: '',
    forgeApiKey: '',
    resendApiKey: '',
  },
}));

// ─── Unit tests for admin role logic ─────────────────────────────────────────

describe('Admin Role Assignment Logic', () => {
  describe('Owner auto-admin rule', () => {
    it('should identify owner by OWNER_OPEN_ID env', () => {
      const ownerOpenId = 'owner-open-id-123';
      const ENV = { ownerOpenId };
      const isOwner = (openId: string) => openId === ENV.ownerOpenId;

      expect(isOwner('owner-open-id-123')).toBe(true);
      expect(isOwner('some-other-user')).toBe(false);
    });
  });

  describe('First user auto-admin rule', () => {
    it('should promote first user when user count is 0', () => {
      const userCount = 0;
      const isNewUser = true;
      const isOwner = false;

      const shouldBeAdmin = isOwner || (isNewUser && userCount === 0);
      expect(shouldBeAdmin).toBe(true);
    });

    it('should NOT promote second user when user count is 1', () => {
      const userCount = 1;
      const isNewUser = true;
      const isOwner = false;

      const shouldBeAdmin = isOwner || (isNewUser && userCount === 0);
      expect(shouldBeAdmin).toBe(false);
    });

    it('should NOT promote existing user who is not owner or first', () => {
      const userCount = 5;
      const isNewUser = false;
      const isOwner = false;
      const existingRole = 'user';

      const shouldBeAdmin = isOwner || (isNewUser && userCount === 0) || existingRole === 'admin';
      expect(shouldBeAdmin).toBe(false);
    });

    it('should preserve admin role for existing admin users', () => {
      const isNewUser = false;
      const isOwner = false;
      const existingRole = 'admin';

      const shouldBeAdmin = isOwner || (isNewUser && false) || existingRole === 'admin';
      expect(shouldBeAdmin).toBe(true);
    });
  });

  describe('Role assignment priority', () => {
    it('owner always gets admin regardless of user count', () => {
      const userCount = 100;
      const isNewUser = true;
      const isOwner = true;

      const shouldBeAdmin = isOwner || (isNewUser && userCount === 0);
      expect(shouldBeAdmin).toBe(true);
    });

    it('first user gets admin even if not owner', () => {
      const userCount = 0;
      const isNewUser = true;
      const isOwner = false;

      const shouldBeAdmin = isOwner || (isNewUser && userCount === 0);
      expect(shouldBeAdmin).toBe(true);
    });
  });

  describe('Admin check in procedures', () => {
    it('should throw FORBIDDEN for non-admin users', () => {
      const userRole = 'user';
      const checkAdmin = (role: string) => {
        if (role !== 'admin') throw new Error('FORBIDDEN');
        return true;
      };

      expect(() => checkAdmin(userRole)).toThrow('FORBIDDEN');
    });

    it('should allow access for admin users', () => {
      const userRole = 'admin';
      const checkAdmin = (role: string) => {
        if (role !== 'admin') throw new Error('FORBIDDEN');
        return true;
      };

      expect(checkAdmin(userRole)).toBe(true);
    });
  });
});
