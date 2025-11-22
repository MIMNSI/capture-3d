import { useState, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoTutorialOverlayProps {
  src: string;
  onComplete: () => void;
  isOpen: boolean;
}

const VideoTutorialOverlay = ({ src, onComplete, isOpen }: VideoTutorialOverlayProps) => {
  const videoTutorialRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen && videoTutorialRef.current) {
      setIsPlaying(true);
      videoTutorialRef.current.play().catch(e => console.error("Error playing video:", e));
    } else if (!isOpen && videoTutorialRef.current) {
      setIsPlaying(false);
      videoTutorialRef.current.pause();
      videoTutorialRef.current.currentTime = 0; // Reset video
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}> {/* Prevent closing by clicking outside */}
      <DialogContent className="fixed inset-0 w-full h-full p-0 flex items-center justify-center bg-black">
        <div className="relative w-full h-full max-w-screen-xl max-h-screen-lg">
          <video
            ref={videoTutorialRef}
            src={src}
            onEnded={onComplete}
            className="w-full h-full object-contain"
            playsInline
            muted // Muted to autoplay in some browsers
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <button
                onClick={() => videoTutorialRef.current?.play()}
                className="w-24 h-24 rounded-full bg-neon flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              >
                <Play className="w-12 h-12 text-background fill-background" />
              </button>
            </div>
          )}
          <button
            onClick={onComplete}
            className="absolute bottom-4 right-4 px-6 py-2 bg-foreground text-background rounded-full font-bold shadow-lg hover:bg-foreground/80 transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoTutorialOverlay;
