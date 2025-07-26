import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectDeviceType,
  isTouchDevice,
  getDeviceInfo,
  isMobileDevice,
  isAppleDevice,
  getCalendarAppName,
} from '../device-detection';

// Mock navigator
const mockNavigator = {
  userAgent: '',
  maxTouchPoints: 0,
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock window
const mockWindow = {
  ontouchstart: undefined,
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('device-detection', () => {
  beforeEach(() => {
    mockNavigator.userAgent = '';
    mockNavigator.maxTouchPoints = 0;
    mockWindow.ontouchstart = undefined;
  });

  describe('detectDeviceType', () => {
    it('detects iOS devices correctly', () => {
      const iosUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
      ];

      iosUserAgents.forEach((userAgent) => {
        expect(detectDeviceType(userAgent)).toBe('ios');
      });
    });

    it('detects Android devices correctly', () => {
      const androidUserAgents = [
        'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
        'Mozilla/5.0 (Linux; Android 9; SM-A505FN)',
      ];

      androidUserAgents.forEach((userAgent) => {
        expect(detectDeviceType(userAgent)).toBe('android');
      });
    });

    it('detects desktop devices correctly', () => {
      const desktopUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Mozilla/5.0 (X11; Linux x86_64)',
      ];

      desktopUserAgents.forEach((userAgent) => {
        expect(detectDeviceType(userAgent)).toBe('desktop');
      });
    });

    it('returns unknown for unrecognized user agents', () => {
      const unknownUserAgents = [
        'Some unknown browser',
        '',
        'Mozilla/5.0 (compatible; Googlebot/2.1)',
      ];

      unknownUserAgents.forEach((userAgent) => {
        expect(detectDeviceType(userAgent)).toBe('unknown');
      });
    });

    it('uses navigator.userAgent when no userAgent is provided', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(detectDeviceType()).toBe('ios');
    });

    it('handles missing navigator gracefully', () => {
      const originalNavigator = global.navigator;
      // @ts-expect-error - Deleting navigator for testing error handling
      delete global.navigator;

      expect(detectDeviceType()).toBe('unknown');

      global.navigator = originalNavigator;
    });
  });

  describe('isTouchDevice', () => {
    it('returns true when ontouchstart is supported', () => {
      (mockWindow as any).ontouchstart = null;
      expect(isTouchDevice()).toBe(true);
    });

    it('returns true when maxTouchPoints > 0', () => {
      mockNavigator.maxTouchPoints = 1;
      expect(isTouchDevice()).toBe(true);
    });

    it('returns false when no touch support is detected', () => {
      // Remove ontouchstart property entirely
      delete mockWindow.ontouchstart;
      mockNavigator.maxTouchPoints = 0;
      expect(isTouchDevice()).toBe(false);
    });

    it('handles missing window gracefully', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Deleting window for testing error handling
      delete global.window;

      expect(isTouchDevice()).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('getDeviceInfo', () => {
    it('returns comprehensive device information', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      (mockWindow as unknown).ontouchstart = null;

      const deviceInfo = getDeviceInfo(userAgent);

      expect(deviceInfo).toEqual({
        type: 'ios',
        isTouch: true,
        userAgent: userAgent,
      });
    });

    it('uses navigator.userAgent when no userAgent is provided', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Android 10; SM-G975F)';
      mockNavigator.maxTouchPoints = 5;

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo.type).toBe('android');
      expect(deviceInfo.isTouch).toBe(true);
      expect(deviceInfo.userAgent).toBe(mockNavigator.userAgent);
    });
  });

  describe('isMobileDevice', () => {
    it('returns true for iOS devices', () => {
      const iosUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isMobileDevice(iosUserAgent)).toBe(true);
    });

    it('returns true for Android devices', () => {
      const androidUserAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';
      expect(isMobileDevice(androidUserAgent)).toBe(true);
    });

    it('returns false for desktop devices', () => {
      const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(isMobileDevice(desktopUserAgent)).toBe(false);
    });

    it('returns false for unknown devices', () => {
      const unknownUserAgent = 'Some unknown browser';
      expect(isMobileDevice(unknownUserAgent)).toBe(false);
    });
  });

  describe('isAppleDevice', () => {
    it('returns true for iOS devices', () => {
      const iosUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
      ];

      iosUserAgents.forEach((userAgent) => {
        expect(isAppleDevice(userAgent)).toBe(true);
      });
    });

    it('returns true for macOS devices', () => {
      const macUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
      expect(isAppleDevice(macUserAgent)).toBe(true);
    });

    it('returns false for non-Apple devices', () => {
      const nonAppleUserAgents = [
        'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Mozilla/5.0 (X11; Linux x86_64)',
      ];

      nonAppleUserAgents.forEach((userAgent) => {
        expect(isAppleDevice(userAgent)).toBe(false);
      });
    });

    it('uses navigator.userAgent when no userAgent is provided', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
      expect(isAppleDevice()).toBe(true);
    });
  });

  describe('getCalendarAppName', () => {
    it('returns "Apple Calendar" for iOS devices', () => {
      const iosUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(getCalendarAppName(iosUserAgent)).toBe('Apple Calendar');
    });

    it('returns "Google Calendar" for Android devices', () => {
      const androidUserAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';
      expect(getCalendarAppName(androidUserAgent)).toBe('Google Calendar');
    });

    it('returns "Calendar" for desktop devices', () => {
      const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(getCalendarAppName(desktopUserAgent)).toBe('Calendar');
    });

    it('returns "Calendar" for unknown devices', () => {
      const unknownUserAgent = 'Some unknown browser';
      expect(getCalendarAppName(unknownUserAgent)).toBe('Calendar');
    });

    it('uses navigator.userAgent when no userAgent is provided', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(getCalendarAppName()).toBe('Apple Calendar');
    });
  });
});