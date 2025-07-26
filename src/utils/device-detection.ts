import { DeviceType, DeviceInfo } from '../types/events';

/**
 * Device detection utility for calendar integration
 * Identifies iOS, Android, and desktop browsers to provide appropriate calendar subscription options
 */

/**
 * Detects the user's device type based on user agent string
 * @param userAgent - Browser user agent string (optional, defaults to navigator.userAgent)
 * @returns DeviceType - ios, android, desktop, or unknown
 */
export function detectDeviceType(userAgent?: string): DeviceType {
  const ua = userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");
  
  // iOS detection (iPhone, iPad, iPod)
  if (/iPad|iPhone|iPod/.test(ua)) {
    return "ios";
  }
  
  // Android detection
  if (/Android/.test(ua)) {
    return "android";
  }
  
  // Desktop detection (Windows, Mac, Linux)
  if (/Windows|Macintosh|Linux/.test(ua)) {
    return "desktop";
  }
  
  return "unknown";
}

/**
 * Detects if the device supports touch interactions
 * @returns boolean - true if touch is supported
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - Legacy IE support for msMaxTouchPoints property
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Gets comprehensive device information
 * @param userAgent - Optional user agent string
 * @returns DeviceInfo object with type, touch support, and user agent
 */
export function getDeviceInfo(userAgent?: string): DeviceInfo {
  const ua = userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");
  
  return {
    type: detectDeviceType(ua),
    isTouch: isTouchDevice(),
    userAgent: ua,
  };
}

/**
 * Checks if the device is likely a mobile device (iOS or Android)
 * @param userAgent - Optional user agent string
 * @returns boolean - true if mobile device
 */
export function isMobileDevice(userAgent?: string): boolean {
  const deviceType = detectDeviceType(userAgent);
  return deviceType === "ios" || deviceType === "android";
}

/**
 * Checks if the device is an Apple device (iOS or macOS)
 * @param userAgent - Optional user agent string
 * @returns boolean - true if Apple device
 */
export function isAppleDevice(userAgent?: string): boolean {
  const ua = userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return /iPad|iPhone|iPod|Macintosh/.test(ua);
}

/**
 * Gets the appropriate calendar app name for the device
 * @param userAgent - Optional user agent string
 * @returns string - Calendar app name for display
 */
export function getCalendarAppName(userAgent?: string): string {
  const deviceType = detectDeviceType(userAgent);
  
  switch (deviceType) {
    case "ios":
      return "Apple Calendar";
    case "android":
      return "Google Calendar";
    case "desktop":
      return "Calendar";
    default:
      return "Calendar";
  }
}