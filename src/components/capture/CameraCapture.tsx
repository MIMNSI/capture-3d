import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Zap, ZapOff, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecordingRound from "./RecordingRound";
import ProcessingScreen from "./ProcessingScreen";
import VideoTutorialOverlay from "./VideoTutorialOverlay"; // Import the new component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CameraCaptureProps {
  onBack: () => void;
}

type CaptureState =
  | "setup"
  | "tutorial-middle"
  | "record-middle"
  | "tutorial-top"
  | "record-top"
  | "tutorial-bottom"
  | "record-bottom"
  | "processing";

// Extend MediaTrackCapabilities for better type safety
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
  zoom?: MediaSettingsRange;
  exposureCompensation?: MediaSettingsRange;
}

// Extend MediaTrackConstraintSet for better type safety
interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
  zoom?: number;
  exposureCompensation?: number;
}

interface ResolutionOption {
  width: number;
  height: number;
  label: string;
}

interface FpsOption {
  value: number;
  label: string;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { width: 3840, height: 2160, label: "4K" },
  { width: 1920, height: 1080, label: "1080p" },
  { width: 1280, height: 720, label: "720p" },
];

const FPS_OPTIONS: FpsOption[] = [
  { value: 60, label: "60 FPS" },
  { value: 30, label: "30 FPS" },
];

const CameraCapture = ({ onBack }: CameraCaptureProps) => {
  const [captureState, setCaptureState] = useState<CaptureState>("setup");
  const [isLandscape, setIsLandscape] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [showExposureSlider, setShowExposureSlider] = useState(false);
  const [currentResolution, setCurrentResolution] = useState<ResolutionOption>(
    RESOLUTION_OPTIONS[1]
  ); // Default to 1080p
  const [currentFps, setCurrentFps] = useState<FpsOption>(FPS_OPTIONS[0]); // Default to 60 FPS
  const [supportedResolutions, setSupportedResolutions] = useState<ResolutionOption[]>([]);
  const [supportedFps, setSupportedFps] = useState<FpsOption[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialVideo, setCurrentTutorialVideo] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const initCamera = useCallback(async (reinit: boolean = false) => {
    if (stream && !reinit) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      // Determine available capabilities
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const tempTrack = tempStream.getVideoTracks()[0];
      const capabilities = tempTrack.getCapabilities();
      tempTrack.stop(); // Stop the temporary stream

      const newSupportedResolutions: ResolutionOption[] = [];
      for (const res of RESOLUTION_OPTIONS) {
        if (
          capabilities.width &&
          capabilities.height &&
          res.width <= (capabilities.width.max || Infinity) &&
          res.height <= (capabilities.height.max || Infinity)
        ) {
          newSupportedResolutions.push(res);
        }
      }
      setSupportedResolutions(newSupportedResolutions.length > 0 ? newSupportedResolutions : RESOLUTION_OPTIONS);

      const newSupportedFps: FpsOption[] = [];
      for (const fpsOption of FPS_OPTIONS) {
        if (
          capabilities.frameRate &&
          fpsOption.value <= (capabilities.frameRate.max || Infinity)
        ) {
          newSupportedFps.push(fpsOption);
        }
      }
      setSupportedFps(newSupportedFps.length > 0 ? newSupportedFps : FPS_OPTIONS);

      // Apply selected constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: currentResolution.width },
          height: { ideal: currentResolution.height },
          frameRate: { ideal: currentFps.value },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((error) => {
          console.error("Error playing video stream:", error);
        });

        const track = mediaStream.getVideoTracks()[0];
        const settings = track.getSettings();
        setCurrentResolution({ width: settings.width || 0, height: settings.height || 0, label: `${settings.width}x${settings.height}` });
        setCurrentFps({ value: settings.frameRate || 0, label: `${settings.frameRate} FPS` });
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        title: "Camera Error",
        description:
          "Unable to access camera. On iOS, please ensure camera access is enabled for Safari/browser in your device settings (Settings > Safari > Camera). Also, check if any other app is currently using the camera. " + error,
        variant: "destructive",
      });
    }
  }, [toast, currentResolution, currentFps]);

  const handleChangeResolution = useCallback(async (res: ResolutionOption) => {
    setCurrentResolution(res);
    await initCamera(true);
  }, [initCamera]);

  const handleChangeFps = useCallback(async (fps: FpsOption) => {
    setCurrentFps(fps);
    await initCamera(true);
  }, [initCamera]);

  useEffect(() => {
    if (captureState === "setup") {
      initCamera();
    } else if (
      captureState.startsWith("tutorial-") &&
      stream &&
      videoRef.current
    ) {
      // Pause camera feed for tutorial
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getVideoTracks()
          .forEach((track) => (track.enabled = false));
      }
      setShowTutorial(true);
      // Set the appropriate tutorial video
      if (captureState === "tutorial-middle") {
        setCurrentTutorialVideo("https://example.com/videos/middle-angle.mp4"); // Placeholder
      } else if (captureState === "tutorial-top") {
        setCurrentTutorialVideo("https://example.com/videos/top-angle.mp4"); // Placeholder
      } else if (captureState === "tutorial-bottom") {
        setCurrentTutorialVideo("https://example.com/videos/bottom-angle.mp4"); // Placeholder
      }
    } else if (captureState.startsWith("record-")) {
      // Resume camera feed for recording
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getVideoTracks()
          .forEach((track) => (track.enabled = true));
      }
      setShowTutorial(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [captureState, initCamera, stream]);

  const toggleFlash = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;

      if (capabilities.torch !== undefined) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }] as ExtendedMediaTrackConstraintSet[]
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          console.error("Error toggling torch:", error);
          toast({
            title: "Flashlight Error",
            description: "Unable to toggle flashlight. Your device might not support this feature or it's currently unavailable.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Flashlight Not Supported",
          description: "Your device does not support flashlight control.",
          variant: "destructive"
        });
      }
    }
  };

  const handleZoomChange = (value: number) => {
    setZoom(value);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities.zoom !== undefined) {
        track.applyConstraints({
          advanced: [{ zoom: value }] as ExtendedMediaTrackConstraintSet[]
        }).catch(error => console.error("Error setting zoom:", error));
      }
    }
  };

  const handleExposureChange = (value: number) => {
    setExposure(value);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities.exposureCompensation !== undefined) {
        track.applyConstraints({
          advanced: [{ exposureCompensation: value }] as ExtendedMediaTrackConstraintSet[]
        }).catch(error => console.error("Error setting exposure compensation:", error));
      }
    }
  };

  const handleRoundComplete = () => {
    if (captureState === "record-middle") {
      setCaptureState("tutorial-top");
    } else if (captureState === "record-top") {
      setCaptureState("tutorial-bottom");
    } else if (captureState === "record-bottom") {
      setCaptureState("processing");
    }
  };

  const handleTutorialComplete = () => {
    if (captureState === "tutorial-middle") {
      setCaptureState("record-middle");
    } else if (captureState === "tutorial-top") {
      setCaptureState("record-top");
    } else if (captureState === "tutorial-bottom") {
      setCaptureState("record-bottom");
    }
  };

  if (!isLandscape) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6 z-50">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-full bg-surface border-2 border-neon shadow-neon flex items-center justify-center">
            <svg className="w-12 h-12 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Rotate Your Device</h2>
          <p className="text-muted-foreground text-lg">
            Please rotate your phone to landscape mode
          </p>
        </div>
      </div>
    );
  }

  if (captureState === "processing") {
    return <ProcessingScreen onComplete={onBack} />;
  }


  return (
    <div className="fixed inset-0 bg-background">
      {/* Video Tutorial Overlay */}
      <VideoPlayerOverlay
        src={currentTutorialVideo}
        onComplete={handleTutorialComplete}
        isOpen={showTutorial}
      />

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${
          showTutorial ? "hidden" : ""
        }`}
      />

      {/* Overlay controls */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          showTutorial ? "hidden" : ""
        }`}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-start items-center pointer-events-auto bg-gradient-to-b from-background/50 to-transparent">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          {/* Resolution Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-foreground font-medium bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-surface transition-colors">
                <span>{currentResolution.label}</span>
                <Settings className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {supportedResolutions.map((res) => (
                <DropdownMenuItem
                  key={`${res.width}x${res.height}`}
                  onClick={() => handleChangeResolution(res)}
                  className={`${currentResolution.width === res.width ? "bg-accent text-accent-foreground" : ""}`}
                >
                  {res.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* FPS Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-foreground font-medium bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-surface transition-colors">
                <span>{currentFps.label}</span>
                <Settings className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {supportedFps.map((fps) => (
                <DropdownMenuItem
                  key={fps.value}
                  onClick={() => handleChangeFps(fps)}
                  className={`${currentFps.value === fps.value ? "bg-accent text-accent-foreground" : ""}`}
                >
                  {fps.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
          {/* Zoom control */}
          <div className="flex flex-col items-center gap-2 bg-overlay/80 backdrop-blur-sm rounded-full p-1 border border-border/50">
            {[0.5, 1, 2, 3].map((zoomLevel) => (
              <button
                key={zoomLevel}
                onClick={() => handleZoomChange(zoomLevel)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  zoom.toFixed(1) === zoomLevel.toFixed(1)
                    ? "bg-neon text-background shadow-neon"
                    : "bg-transparent text-foreground/70 hover:text-foreground"
                }`}
              >
                {zoomLevel}x
              </button>
            ))}
          </div>

          {/* Exposure control */}
          <div className="flex flex-col items-center gap-2 bg-overlay/80 backdrop-blur-sm rounded-full p-1 border border-border/50">
            <button
              onClick={() => setShowExposureSlider(!showExposureSlider)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors bg-transparent text-foreground/70 hover:text-foreground"
            >
              EXP
            </button>
            {showExposureSlider && (
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={exposure}
                onChange={(e) => handleExposureChange(parseFloat(e.target.value))}
                className="slider-vertical h-20 w-1 appearance-none bg-surface rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neon [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-neon [&::-moz-range-thumb]:cursor-pointer mt-1"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
            )}
          </div>
        </div>

        {/* Safe frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 border-2 border-foreground/50 rounded-lg" />
        </div>


        {/* Recording round UI */}
        {(captureState === "record-middle" ||
          captureState === "record-top" ||
          captureState === "record-bottom") && (
          <RecordingRound
            round={
              captureState === "record-middle"
                ? 1
                : captureState === "record-top"
                ? 2
                : 3
            }
            onComplete={handleRoundComplete}
            stream={stream}
          />
        )}

        {/* Bottom bar with controls and shutter */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center pointer-events-auto bg-gradient-to-t from-background/50 to-transparent">
          <button
            onClick={toggleFlash}
            className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
          >
            {flashEnabled ? (
              <Zap className="w-5 h-5 text-neon fill-neon" />
            ) : (
              <ZapOff className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Shutter button (only in setup) */}
          {captureState === "setup" && (
            <button
              onClick={() => setCaptureState("tutorial-middle")}
              className="w-20 h-20 rounded-full bg-neon hover:bg-neon/80 flex items-center justify-center shadow-neon transition-all hover:scale-105"
            >
              <Circle className="w-12 h-12 text-background fill-background" />
            </button>
          )}
          {/* Placeholder for other modes/settings */}
          <div className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;

