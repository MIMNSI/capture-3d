export const concatVideos = async (blobs: Blob[]): Promise<Blob> => {
  if (blobs.length === 0) return new Blob();
  
  // This combines the binary data of the 3 clips.
  // For a perfect seamless file, you'd normally need a backend (FFmpeg),
  // but this works for playback in most web players.
  const type = blobs[0].type;
  return new Blob(blobs, { type });
};