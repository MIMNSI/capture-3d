import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Import custom components
import { CameraRecorder } from "../CameraRecorder";
import { AngleHeader } from "../AngleHeader";
import { TutorialModal } from "../TutorialModal";
import { SavePreview } from "../SavePreview"; // Final preview screen

// Import utilities
import { performAutoCheck } from "@/utils/autoCheck";
import { concatVideos } from "@/utils/videoConcat";

// Import UI components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onBack?: () => void; // Optional prop if used as a standalone component
}

const CameraCapture = ({ onBack }: CameraCaptureProps) => {
  const navigate = useNavigate();
  
  // State Management
  const [angleStep, setAngleStep] = useState<1 | 2 | 3>(1); // 1=Middle, 2=Top, 3=Bottom
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [showTutorial, setShowTutorial] = useState(true); // Show tutorial for the first angle immediately
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string[] | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);

  // Handler: Called when CameraRecorder finishes a valid take
  const handleRecordingComplete = async (blob: Blob) => {
    setIsChecking(true);
    
    // 1. Run Auto Check (Quality Control)
    const checkResult = await performAutoCheck(blob);
    
    setIsChecking(false);

    if (!checkResult.ok) {
      setCheckError(checkResult.errors);
      return; // Stop here, show error modal
    }

    if (checkResult.warnings.length > 0) {
      checkResult.warnings.forEach(w => toast.warning(w));
    }

    // 2. Store Blob
    const newBlobs = [...blobs, blob];
    setBlobs(newBlobs);

    // 3. Decide next step
    if (angleStep < 3) {
      // Move to next angle
      setAngleStep(prev => (prev + 1) as 1 | 2 | 3);
      setShowTutorial(true); // Trigger tutorial for the NEW angle
    } else {
      // Finished all 3 angles -> Start Merge
      processFinalVideo(newBlobs);
    }
  };

  // Logic: Merge all segments into one continuous video
  const processFinalVideo = async (allBlobs: Blob[]) => {
    try {
      toast.info("Processing final video...");
      const concatenated = await concatVideos(allBlobs);
      setFinalBlob(concatenated);
      toast.success("3D Scan ready for preview!");
    } catch (e) {
      toast.error("Failed to process video.");
      console.error("Merge error:", e);
    }
  };

  const handleTutorialStart = () => {
    setShowTutorial(false);
  };

  const handleRetryAngle = () => {
    setCheckError(null);
    // Closing the error modal allows the user to interact with CameraRecorder again.
    // The CameraRecorder component manages its own internal "retake" state.
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  // If processing is done, show the Final Preview Page
  // This replaces the current view entirely
  if (finalBlob) {
    return <SavePreview videoBlob={finalBlob} onBack={() => navigate("/")} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background relative">
      
      {/* Back Button (Absolute positioning to float over UI) */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* 1. Error Modal (Auto-Check Failed) */}
      <Dialog open={!!checkError} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-card border-destructive/50">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive gap-2">
              <AlertTriangle className="h-5 w-5" /> Recording Issue
            </DialogTitle>
            <DialogDescription className="text-foreground/80">
              We detected some issues with your recording. Please retake this angle.
              <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                {checkError?.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleRetryAngle} variant="default" className="w-full sm:w-auto">
              Retake Angle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Tutorial Modal (Instructions specific to current angle) */}
      <TutorialModal 
        isOpen={showTutorial} 
        angle={angleStep === 1 ? "middle" : angleStep === 2 ? "top" : "bottom"} 
        onStart={handleTutorialStart} 
      />

      {/* 3. Checking Overlay (Loading state during checks/merging) */}
      {isChecking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-white flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md bg-neon/50 animate-pulse" />
              <Loader2 className="w-12 h-12 animate-spin relative z-10 text-neon" />
            </div>
            <p className="mt-6 text-lg font-medium text-white/90">Analyzing recording quality...</p>
          </div>
        </div>
      )}

      {/* 4. Main UI Components */}
      <AngleHeader currentAngle={angleStep} />
      
      <div className="flex-1 relative">
        {/* KEY PROP IS CRITICAL: 
          Changing the key ({angleStep}) forces React to unmount the old CameraRecorder 
          and mount a fresh one. This ensures the timer resets, the preview clears, 
          and the internal state is clean for the new angle.
        */}
        <CameraRecorder 
          key={angleStep} 
          onRecordingComplete={handleRecordingComplete}
          minDuration={12}
        />
      </div>
    </div>
  );
};

export default CameraCapture;