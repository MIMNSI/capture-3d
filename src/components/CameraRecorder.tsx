import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/formatTime";
import { Play, Pause, Square, RotateCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Custom hook to check screen orientation
const useScreenOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isLandscape;
};

interface CameraRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  minDuration?: number; // seconds
}

export const CameraRecorder = ({ onRecordingComplete, minDuration = 12 }: CameraRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"idle" | "recording" | "paused" | "stopped">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isLandscape = useScreenOrientation();

  // Enforce Landscape Mode
  useEffect(() => {
    if (screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as any).lock("landscape").catch(() => {
        console.warn("Screen orientation lock failed.");
      });
    }

    return () => {
      // Unlock on component unmount
      if (screen.orientation && 'unlock' in screen.orientation) {
        (screen.orientation as any).unlock();
      }
    };
  }, []);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        // Request camera with preference for back camera and 1080p
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment", 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          },
          audio: false, // Audio is usually not needed for photogrammetry
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera Error:", err);
        toast.error("Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "recording") {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    setElapsed(0);
    
    // Prefer high-efficiency codecs if available
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") 
        ? "video/webm;codecs=vp9" 
        : "video/webm";

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setPreviewUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Slice data every second
      setStatus("recording");
    } catch (e) {
      console.error(e);
      toast.error("Failed to start recording. Your device might not support this format.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setStatus("stopped");
    }
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    
    setPreviewUrl(null);
    setStatus("idle");
    setElapsed(0);
    chunksRef.current = [];
    
    // Re-attach stream to video element if needed
    if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.error);
    }
  };

  const handleAccept = () => {
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      onRecordingComplete(blob);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-row bg-black">
      
      {/* Orientation Enforcer Message */}
      {!isLandscape && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-foreground">
          <RotateCw className="w-16 h-16 mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
          <p className="text-muted-foreground max-w-xs text-center">
            This experience is designed to be used in landscape mode for the best results.
          </p>
        </div>
      )}

      {/* Video Viewport */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {previewUrl ? (
          <video src={previewUrl} controls playsInline className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
        )}
        
        {/* Overlays (Only show when live camera is active) */}
        {!previewUrl && (
          <>
            {/* Target Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border-2 border-white/20 border-dashed" />
            </div>
            
            {/* Timer HUD */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
              <div className="bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-white font-mono font-bold flex items-center gap-2 shadow-lg">
                <div className={cn("w-3 h-3 rounded-full transition-colors", status === "recording" ? "bg-red-500 animate-pulse" : "bg-zinc-500")} />
                {formatTime(elapsed)}
              </div>
            </div>

            {/* Min Duration Warning */}
            {elapsed > 0 && elapsed < minDuration && status !== "idle" && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none animate-in fade-in">
                 <span className="text-white text-sm font-semibold px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full shadow-sm">
                   Keep recording... ({minDuration - elapsed}s left)
                 </span>
               </div>
            )}
          </>
        )}
      </div>

      {/* Controls Bar (Vertical on the right) */}
      <div className="w-32 bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 border-l border-border">
        {status === "idle" && (
          <Button
            onClick={startRecording}
            size="icon"
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 border-4 border-background ring-2 ring-red-600/50 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <div className="w-8 h-8 bg-white rounded-sm shadow-sm" />
          </Button>
        )}

        {(status === "recording" || status === "paused") && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
             <Button
              onClick={stopRecording}
              size="icon"
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Square className="w-8 h-8 fill-current text-white" />
            </Button>

            {status === "recording" ? (
              <Button onClick={pauseRecording} variant="secondary" size="icon" className="w-14 h-14 rounded-full shadow-md">
                <Pause className="w-6 h-6" />
              </Button>
            ) : (
              <Button onClick={resumeRecording} variant="secondary" size="icon" className="w-14 h-14 rounded-full shadow-md">
                <Play className="w-6 h-6 ml-1" />
              </Button>
            )}
          </div>
        )}

        {status === "stopped" && previewUrl && (
          <div className="flex flex-col items-center gap-4 w-full animate-in fade-in">
            <Button onClick={handleAccept} className="w-full py-4 text-base font-semibold">
              <CheckCircle className="mr-2 w-4 h-4" />
              Use Video
            </Button>
            <Button onClick={handleRetake} variant="outline" className="w-full py-4 text-base">
              <RotateCw className="mr-2 w-4 h-4" />
              Retake
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};