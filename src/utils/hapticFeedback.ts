/**
 * Provides subtle haptic feedback on supported devices
 * @param duration Duration in milliseconds (default: 50ms for subtle feedback)
 */
export function hapticFeedback(duration: number = 50): void {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // Silently fail if vibration is not supported or permission denied
      console.debug('Haptic feedback not available', e);
    }
  }
}
