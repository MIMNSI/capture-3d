export interface CheckResult {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

export const performAutoCheck = async (
  videoBlob: Blob,
  expectedDurationMin: number = 12
): Promise<CheckResult> => {
  const warnings: string[] = [];
  const errors: string[] = [];

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(videoBlob);
    video.src = url;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);

      const { videoWidth, videoHeight, duration } = video;

      // 1. Orientation Check (Must be Landscape)
      // We check if width is greater than height
      if (videoHeight > videoWidth) {
        errors.push("Video is in portrait mode. Please record in landscape (horizontal).");
      }

      // 2. Resolution Check (Targeting 1080p or higher)
      // In landscape, height should be at least 1080 for "Full HD"
      // We'll allow 720p with a warning, but fail below that for high quality 3D
      if (videoHeight < 720) {
        errors.push(`Resolution too low (${videoWidth}x${videoHeight}). Minimum 720p required.`);
      } else if (videoHeight < 1080) {
        warnings.push(`Resolution is ${videoWidth}x${videoHeight}. 1080p is recommended for better 3D results.`);
      }

      // 3. Duration Check
      if (duration < expectedDurationMin) {
        errors.push(`Recording is too short (${duration.toFixed(1)}s). Minimum ${expectedDurationMin} seconds required.`);
      }

      // 4. Brightness/Blur Heuristic (Simplified)
      // A full implementation requires analyzing frame pixel data via Canvas.
      // For this step, we ensure the file size isn't suspiciously small (implying solid black/no data).
      if (videoBlob.size < 100 * 1024) { // Less than 100KB
        errors.push("Video file is suspiciously small. Please check your camera.");
      }

      resolve({
        ok: errors.length === 0,
        warnings,
        errors
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      errors.push("Failed to process video data. The file may be corrupted.");
      resolve({ ok: false, warnings, errors });
    };
  });
};