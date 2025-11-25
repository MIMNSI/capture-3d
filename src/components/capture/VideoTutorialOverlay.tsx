import { useState, useEffect, useRef } from "react";
import { Play, ArrowRight } from "lucide-react";

interface VideoTutorialOverlayProps {
  src: string;
  onComplete: () => void;
  isOpen: boolean;
}

const VideoTutorialOverlay = ({ src, onComplete, isOpen }: VideoTutorialOverlayProps) => {
  const videoTutorialRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Lock screen to landscape for tutorial
      if (screen.orientation && "lock" in screen.orientation) {
        (screen.orientation as any).lock("landscape").catch(() => {
          console.log("Screen orientation lock not supported");
        });
      }
    }
  }, [isOpen]);

  const handleTimeUpdate = () => {
    if (videoTutorialRef.current && !videoEnded) {
      const video = videoTutorialRef.current;
      if (video.duration > 0 && video.currentTime >= video.duration - 0.5) {
        setVideoEnded(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen && videoTutorialRef.current) {
      setIsPlaying(true);
      videoTutorialRef.current.play().catch(e => console.error("Error playing video:", e));
    } else if (!isOpen && videoTutorialRef.current) {
      setIsPlaying(false);
      videoTutorialRef.current.pause();
      videoTutorialRef.current.currentTime = 0;
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col lg:flex-row text-white">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-zinc-900 text-white p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">How to Record</h2>
          <p className="text-gray-300 text-sm">Walk 360° around the object</p>

          {/* INSTAGRAM STORY STYLE BOX */}
          <div className="mt-6 w-full h-[36vh] bg-[#1f1f1f] rounded-2xl flex items-center justify-center text-gray-400 text-xl">
            Instruction
          </div>
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={onComplete}
              className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-bold text-white text-lg shadow-lg"
            >
              Skip Tutorial
            </button>
            <button
              onClick={onComplete}
              disabled={false}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 disabled:bg-zinc-500 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-black flex items-center justify-center p-6 overflow-hidden">
        <div className="relative max-w-full max-h-full aspect-video bg-[#1a1a1a] rounded-2xl flex items-center justify-center overflow-hidden">
          <video
            ref={videoTutorialRef}
            src={src}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {!isPlaying && (
            <button
              onClick={() => {
                videoTutorialRef.current?.play();
                setIsPlaying(true);
              }}
              className="absolute w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-105 transition-all"
            >
              <Play className="w-12 h-12 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTutorialOverlay;