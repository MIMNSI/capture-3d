import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/formatTime";
import { 
  RotateCw, 
  CheckCircle, 
  MonitorSmartphone, 
  RotateCcw,
  Loader2,
  Square
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const useScreenOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isLandscape;
};

interface CameraRecorderProps {
  angleLabel: string;
  onRecordingComplete: (blob: Blob) => void;
}

export const CameraRecorder = ({ angleLabel, onRecordingComplete }: CameraRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"idle" | "recording" | "review">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const [hasZoom, setHasZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const isLandscape = useScreenOrientation();

  // --- 1. START CAMERA AUTOMATICALLY ---
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const track = stream.getVideoTracks()[0];
        if (track.getCapabilities && 'zoom' in track.getCapabilities()) setHasZoom(true);
      } catch (err) {
        console.error(err);
        toast.error("Camera access denied");
      }
    };
    initCamera();
    
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // --- 2. AUTO STOP AT 30s ---
  useEffect(() => {
    if (status === "recording" && elapsed >= 30) {
      handleStop();
      if (navigator.vibrate) navigator.vibrate(200);
    }
  }, [elapsed, status]);

  // --- 3. TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "recording") {
      interval = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleStart = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setElapsed(0);
    
    const mimeType = MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm";
    const recorder = new MediaRecorder(streamRef.current, { mimeType, videoBitsPerSecond: 15000000 });

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setStatus("review");
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setStatus("recording");
  };

  const handleStop = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordedBlob(null);
    setStatus("idle");
    setElapsed(0);
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleConfirm = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
    }
  };

  const toggleZoom = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const newZoom = zoomLevel === 1 ? 2 : 1;
    try {
      // @ts-ignore
      await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
      setZoomLevel(newZoom);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden flex font-sans" style={{ touchAction: 'none' }}>
      {!isLandscape && (
        <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center text-white">
          <RotateCw className="w-12 h-12 mb-4 animate-spin-slow" />
          <p>Rotate to Landscape</p>
        </div>
      )}

      {/* VIDEO */}
      <div className="absolute inset-0 w-full h-full z-0">
        {status === "review" && previewUrl ? (
          <video src={previewUrl} autoPlay loop playsInline className="w-full h-full object-contain bg-black" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-105" />
        )}
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-24 h-24 z-20 pointer-events-none flex flex-col items-center pt-6 bg-gradient-to-b from-black/60 to-transparent">
        <h2 className="text-white/90 font-bold uppercase tracking-widest text-sm drop-shadow-md mb-1">{angleLabel}</h2>
        <div className={cn("text-4xl font-mono font-black drop-shadow-xl", status === "recording" ? "text-red-500" : "text-white")}>
          {formatTime(elapsed)}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute top-0 bottom-0 right-0 w-28 z-30 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md border-l border-white/10">
        {status === "review" ? (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right">
            <Button onClick={handleConfirm} className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg border-4 border-white/10 p-0 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </Button>
            <span className="text-xs font-bold text-white/80 uppercase">Next</span>
            
            <div className="h-4" />

            <Button onClick={handleRetake} variant="outline" className="w-14 h-14 rounded-full border-2 border-white/30 bg-black/40 text-white p-0 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </Button>
            <span className="text-xs font-bold text-white/50 uppercase">Retake</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {hasZoom && (
              <Button variant="ghost" onClick={toggleZoom} className="w-12 h-12 rounded-full border border-white/20 text-white font-bold text-xs">
                {zoomLevel}x
              </Button>
            )}
            <button 
              onClick={status === "idle" ? handleStart : handleStop}
              className="group relative w-20 h-20 flex items-center justify-center transition-transform active:scale-95"
            >
              <div className="absolute inset-0 rounded-full border-[5px] border-white opacity-100 shadow-lg" />
              {status === "recording" ? (
                <div className="w-8 h-8 bg-red-500 rounded-sm shadow-inner" />
              ) : (
                <div className="w-16 h-16 bg-red-500 rounded-full shadow-inner" />
              )}
            </button>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest rotate-90 mt-2">
              {status === "idle" ? "START" : "STOP"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};