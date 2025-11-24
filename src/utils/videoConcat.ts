/**
 * Concatenates multiple video blobs into a single Blob.
 * * Note: For a true single-file MP4 with corrected timestamps and compatibility
 * across all players, you would typically use ffmpeg.wasm. 
 * This implementation uses Blob concatenation which works for playback in 
 * most modern browsers (Chrome/Firefox) but preserves the mime type of the segments.
 */
export const concatVideos = async (blobs: Blob[]): Promise<Blob> => {
  if (!blobs || blobs.length === 0) {
    throw new Error("No videos to concatenate");
  }

  // We assume all blobs are of the same type (e.g., video/webm;codecs=vp9)
  const type = blobs[0].type;
  
  // Simple binary concatenation
  return new Blob(blobs, { type });
};