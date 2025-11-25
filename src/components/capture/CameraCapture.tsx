import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";

import { CameraRecorder } from "@/components/CameraRecorder";
import { TutorialModal } from "@/components/TutorialModal";
import { SavePreview } from "@/components/SavePreview"; 
import { performAutoCheck } from "@/utils/autoCheck";
import { concatVideos } from "@/utils/videoConcat";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onBack?: () => void;
}

const CameraCapture = ({ onBack }: CameraCaptureProps) => {
  const navigate = useNavigate();
  
  // --- Flow State ---
  const [angleStep, setAngleStep] = useState<1 | 2 | 3>(1); // Tracks which angle we are on
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [showTutorial, setShowTutorial] = useState(true); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [checkError, setCheckError] = useState<string[] | null>(null);

  const getAngleLabel = () => {
    if (angleStep === 1) return "Middle Angle (1/3)";
    if (angleStep === 2) return "Top Angle (2/3)";
    return "Bottom Angle (3/3)";
  };

  // --- STEP COMPLETE LOGIC ---
  const handleAngleComplete = async (blob: Blob) => {
    setIsProcessing(true);
    
    // 1. Quality Check
    const check = await performAutoCheck(blob, 3); // Min 3s
    setIsProcessing(false);

    if (!check.ok) {
      setCheckError(check.errors);
      return; // Stay on current step
    }

    // 2. Save Blob
    const newBlobs = [...recordedBlobs, blob];
    setRecordedBlobs(newBlobs);

    // 3. Advance Flow
    if (angleStep === 1) {
      setAngleStep(2); // Go to Top
      setShowTutorial(true); 
    } else if (angleStep === 2) {
      setAngleStep(3); // Go to Bottom
      setShowTutorial(true);
    } else {
      // Finish
      finishRecording(newBlobs);
    }
  };

  const finishRecording = async (allBlobs: Blob[]) => {
    setIsProcessing(true);
    try {
      const merged = await concatVideos(allBlobs);
      setFinalBlob(merged);
      toast.success("All angles captured!");
    } catch (e) {
      toast.error("Error merging videos");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  if (finalBlob) {
    return <SavePreview videoBlob={finalBlob} onBack={() => navigate("/")} />;
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      
      {/* Back Button */}
      {!showTutorial && (
        <div className="absolute top-4 left-4 z-50">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-white bg-black/20 backdrop-blur-md hover:bg-black/40 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Error Modal */}
      <Dialog open={!!checkError} onOpenChange={() => setCheckError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Recording Issue</DialogTitle>
            <DialogDescription>
               <ul>{checkError?.map((e, i) => <li key={i}>- {e}</li>)}</ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setCheckError(null)}>Retake</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={showTutorial} 
        angle={angleStep === 1 ? "middle" : angleStep === 2 ? "top" : "bottom"} 
        onStart={() => setShowTutorial(false)} 
      />

      {/* Processing Screen */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Processing...</p>
          </div>
        </div>
      )}

      {/* Main Recorder */}
      {/* KEY PROP ensures fresh camera every time angle changes */}
      {!showTutorial && !isProcessing && (
        <CameraRecorder 
          key={angleStep}
          angleLabel={getAngleLabel()}
          onRecordingComplete={handleAngleComplete}
        />
      )}
    </div>
  );
};

export default CameraCapture;