import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RotateCcw, CheckCircle, Loader2, Home } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadData } from "aws-amplify/storage";
import { useSearchParams } from "react-router-dom";

interface SavePreviewProps {
  videoBlob: Blob;
  onBack: () => void;
}

export const SavePreview = ({ videoBlob, onBack }: SavePreviewProps) => {
  const videoUrl = useMemo(() => URL.createObjectURL(videoBlob), [videoBlob]);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize search params
  const [searchParams] = useSearchParams();

  const handleSubmit = async () => {
    setIsUploading(true);
    
    try {
      // Extract 'userId' from the URL, default to 'guest' if missing
      const userId = searchParams.get("userId") || "guest";
      
      // Append userId to the filename
      const fileName = `capture-${userId}-${Date.now()}.mp4`;

      const result = await uploadData({
        key: fileName,
        data: videoBlob,
        options: {
          contentType: "video/mp4",
        }
      }).result;

      console.log("Upload success:", result);
      toast.success("Video submitted successfully!");
      setIsSaved(true);

    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExit = () => {
    // Attempt to close the tab
    window.close();
    // Fallback if window.close() is blocked (common in some browser contexts)
    toast.info("If the tab didn't close, please close it manually.");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col h-full w-full font-sans">
      
      {/* FULL SCREEN VIDEO PREVIEW */}
      <div className="flex-1 relative w-full h-full bg-black">
        <video 
          src={videoUrl} 
          autoPlay 
          loop 
          playsInline 
          controls={true} 
          className="w-full h-full object-contain"
        />
        
        {/* TOP OVERLAY: TITLE */}
        <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
           <div className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/10 shadow-lg">
             Preview Scan
           </div>
        </div>
      </div>

      {/* BOTTOM OVERLAY: ACTION BUTTONS */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          
          {/* Main Actions Row */}
          <div className="flex gap-4 w-full">
            {/* RETAKE BUTTON */}
            <Button 
              variant="outline" 
              onClick={onBack} 
              disabled={isUploading || isSaved}
              className="flex-1 h-14 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl text-base font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RotateCcw className="mr-2 w-5 h-5" /> Retake
            </Button>

            {/* SUBMIT BUTTON */}
            <Button 
              onClick={handleSubmit} 
              disabled={isUploading || isSaved}
              className={cn(
                  "flex-1 h-14 text-base font-bold rounded-xl transition-all active:scale-95 shadow-lg",
                  isSaved 
                      ? "bg-zinc-800 text-green-400 hover:bg-zinc-800 cursor-default border border-green-500/30" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isUploading ? (
                  <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Uploading...
                  </>
              ) : isSaved ? (
                  <>
                      <CheckCircle className="mr-2 w-5 h-5" /> Submitted
                  </>
              ) : (
                  <>
                      <Upload className="mr-2 w-5 h-5" /> Submit Video
                  </>
              )}
            </Button>
          </div>

          {/* EXIT BUTTON (New) */}
          <Button
            variant="ghost"
            onClick={handleExit}
            className="w-full text-white/70 hover:text-white hover:bg-white/10 h-10 mt-2"
          >
            <Home className="mr-2 w-4 h-4" />
            Go back to your 3D garage
          </Button>

        </div>
      </div>
    </div>
  );
};