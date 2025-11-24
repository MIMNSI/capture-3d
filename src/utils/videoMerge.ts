import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

/**
 * Initialize FFmpeg instance
 */
export const initFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  // Load FFmpeg
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
};

/**
 * Merge multiple video blobs into a single video
 * @param blobs Array of video blobs to merge
 * @returns Merged video blob
 */
export const mergeVideos = async (blobs: Blob[]): Promise<Blob> => {
  if (blobs.length === 0) {
    throw new Error('No videos to merge');
  }

  if (blobs.length === 1) {
    return blobs[0];
  }

  const ffmpegInstance = await initFFmpeg();

  try {
    // Write input files
    for (let i = 0; i < blobs.length; i++) {
      const fileName = `input${i}.webm`;
      await ffmpegInstance.writeFile(fileName, await fetchFile(blobs[i]));
    }

    // Create concat file list
    const concatList = blobs.map((_, i) => `file 'input${i}.webm'`).join('\n');
    await ffmpegInstance.writeFile('concat.txt', concatList);

    // Run FFmpeg concat command
    await ffmpegInstance.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'output.webm'
    ]);

    // Read output file
    const data = await ffmpegInstance.readFile('output.webm');
    
    // Clean up
    for (let i = 0; i < blobs.length; i++) {
      await ffmpegInstance.deleteFile(`input${i}.webm`);
    }
    await ffmpegInstance.deleteFile('concat.txt');
    await ffmpegInstance.deleteFile('output.webm');

    // Convert to Blob - cast to any to work around TypeScript type issue
    const blob = new Blob([data as any], { type: 'video/webm' });
    return blob;
  } catch (error) {
    console.error('Video merge error:', error);
    throw new Error('Failed to merge videos');
  }
};

/**
 * Download blob to device
 * @param blob Blob to download
 * @param filename Filename for download
 */
export const downloadVideo = (blob: Blob, filename: string = '3d-scan-merged.webm') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
