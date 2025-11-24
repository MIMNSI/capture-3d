import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CameraRecorder } from "../components/CameraRecorder";
import { AngleHeader } from "../components/AngleHeader";
import { TutorialModal } from "../components/TutorialModal";
import { SavePreview } from "../components/SavePreview";
import { performAutoCheck } from "../utils/autoCheck";
import { concatVideos } from "../utils/videoConcat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

const RecordFlow = () => {
  const navigate = useNavigate();
  
  // State Management
  const [angleStep, setAngleStep] = useState<1 | 2 | 3>(1); // 1=Middle, 2=Top, 3=Bottom
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [showTutorial, setShowTutorial] = useState(true); // Show tutorial for first angle immediately
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
      return; // Stop here, force retake
    }

    if (checkResult.warnings.length > 0) {
      checkResult.warnings.forEach(w => toast.warning(w));
    }

    // 2. Store Blob
    const newBlobs = [...blobs, blob];
    setBlobs(newBlobs);

    // 3. Decide next step
    if (angleStep < 3) {
      setAngleStep(prev => (prev + 1) as 1 | 2 | 3);
      setShowTutorial(true); // Show tutorial for NEXT angle
    } else {
      // Finished all 3 angles -> Merge!
      processFinalVideo(newBlobs);
    }
  };

  // Logic: Merge all segments into one
  const processFinalVideo = async (allBlobs: Blob[]) => {
    try {
      toast.info("Processing video...");
      const concatenated = await concatVideos(allBlobs);
      setFinalBlob(concatenated);
      toast.success("3D Scan ready for preview!");
    } catch (e) {
      toast.error("Failed to process video.");
      console.error(e);
    }
  };

  const handleTutorialStart = () => {
    setShowTutorial(false);
  };

  const handleRetryAngle = () => {
    setCheckError(null);
    // We just close the modal; CameraRecorder state is reset by key prop change or internal logic if needed
  };

  // If processing is done, show the Final Preview Page
  if (finalBlob) {
    return <SavePreview videoBlob={finalBlob} onBack={() => navigate("/")} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 1. Error Modal (Auto-Check Failed) */}
      <Dialog open={!!checkError} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive gap-2">
              <AlertTriangle /> Recording Issue
            </DialogTitle>
            <DialogDescription>
              We detected some issues with your recording:
              <ul className="list-disc pl-5 mt-2 text-foreground">
                {checkError?.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleRetryAngle} variant="default">Retake Angle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Tutorial Modal (Instructions for current angle) */}
      <TutorialModal 
        isOpen={showTutorial} 
        angle={angleStep === 1 ? "middle" : angleStep === 2 ? "top" : "bottom"} 
        onStart={handleTutorialStart} 
      />

      {/* 3. Checking Overlay (Loading state) */}
      {isChecking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="text-white flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-neon" />
            <p>Analyzing recording quality...</p>
          </div>
        </div>
      )}

      {/* 4. Main UI */}
      <AngleHeader currentAngle={angleStep} />
      
      <div className="flex-1 relative">
        {/* Key prop forces CameraRecorder to completely reset when angle changes */}
        <CameraRecorder 
          key={angleStep} 
          onRecordingComplete={handleRecordingComplete}
          minDuration={12}
        />
      </div>
    </div>
  );
};

export default RecordFlow;