/**
 * Play notification sound with fade out
 * @param audioPath Path to the audio file
 * @param duration Duration in seconds (default: 5)
 * @param fadeOutDuration Fade out duration in seconds (default: 1)
 * @param volume Initial volume (0-1, default: 0.3)
 */
export const playNotificationSound = async (
  audioPath: string,
  duration: number = 5,
  fadeOutDuration: number = 1,
  volume: number = 0.3
): Promise<void> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioPath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set initial volume
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    // Start fade out at (duration - fadeOutDuration) seconds
    const fadeStartTime = audioContext.currentTime + duration - fadeOutDuration;
    gainNode.gain.setValueAtTime(volume, fadeStartTime);
    gainNode.gain.linearRampToValueAtTime(0, fadeStartTime + fadeOutDuration);

    // Start playing
    source.start(0);
    // Stop after duration seconds
    source.stop(audioContext.currentTime + duration);

  } catch (error) {
    console.log('Audio playback prevented:', error);
  }
};
