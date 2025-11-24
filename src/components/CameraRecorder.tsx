import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/formatTime";
import { Play, Pause, Square, RotateCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* Video Viewport */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {previewUrl ? (
          <video src={previewUrl} controls playsInline className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        
        {/* Overlays (Only show when live camera is active) */}
        {!previewUrl && (
          <>
            {/* Target Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border-2 border-white/20 border-dashed" />
            </div>
            
            {/* Timer HUD */}
            <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
              <div className="bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-white font-mono font-bold flex items-center gap-2 shadow-lg">
                <div className={cn("w-3 h-3 rounded-full transition-colors", status === "recording" ? "bg-red-500 animate-pulse" : "bg-zinc-500")} />
                {formatTime(elapsed)}
              </div>
            </div>

            {/* Min Duration Warning */}
            {elapsed > 0 && elapsed < minDuration && status !== "idle" && (
               <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                 <span className="text-white text-sm font-semibold px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full shadow-sm">
                   Keep recording... ({minDuration - elapsed}s left)
                 </span>
               </div>
            )}
          </>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-32 bg-background/90 backdrop-blur-xl flex items-center justify-center p-6 border-t border-border">
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
          <div className="flex items-center gap-8 animate-in fade-in zoom-in-95 duration-200">
            {status === "recording" ? (
              <Button onClick={pauseRecording} variant="secondary" size="icon" className="w-14 h-14 rounded-full shadow-md">
                <Pause className="w-6 h-6" />
              </Button>
            ) : (
              <Button onClick={resumeRecording} variant="secondary" size="icon" className="w-14 h-14 rounded-full shadow-md">
                <Play className="w-6 h-6 ml-1" />
              </Button>
            )}

            <Button 
              onClick={stopRecording} 
              size="icon" 
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Square className="w-8 h-8 fill-current text-white" />
            </Button>
          </div>
        )}

        {status === "stopped" && previewUrl && (
          <div className="flex items-center gap-4 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4">
            <Button onClick={handleRetake} variant="outline" className="flex-1 py-6 text-base border-2">
              <RotateCw className="mr-2 w-4 h-4" />
              Retake
            </Button>
            <Button 
              onClick={handleAccept} 
              className="flex-1 py-6 text-base font-semibold"
              disabled={elapsed < minDuration}
            >
              <CheckCircle className="mr-2 w-4 h-4" />
              Use Video
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};