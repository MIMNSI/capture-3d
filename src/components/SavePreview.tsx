import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, Upload, Scissors, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface SavePreviewProps {
  videoBlob: Blob;
  onBack: () => void;
}

export const SavePreview = ({ videoBlob, onBack }: SavePreviewProps) => {
  const videoUrl = useRef(URL.createObjectURL(videoBlob)).current;
  const [isUploading, setIsUploading] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `3d-capture-merged-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Download started");
  };

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulate API upload
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Uploaded successfully!");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="p-4 flex items-center border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="ml-2 font-semibold text-lg">Review Capture</h1>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center bg-black/5 p-4 overflow-hidden">
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-border/50">
          <video 
            src={videoUrl} 
            controls 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="bg-card border-t border-border p-6 space-y-6 shadow-lg-up">
        {/* Trim Control (Visual Only for Phase 2) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
              <Scissors className="w-4 h-4"/> Trim Video
            </span>
            <span>Full Duration</span>
          </div>
          <Slider defaultValue={[0, 100]} max={100} step={1} className="w-full" disabled />
          <p className="text-xs text-muted-foreground text-center">
            Trimming is disabled for merged videos in this version.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleDownload} className="w-full py-6 text-base">
            <Download className="mr-2 w-4 h-4" /> Download
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading} 
            className="w-full py-6 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {isUploading ? "Uploading..." : (
              <>
                <Upload className="mr-2 w-4 h-4" /> Upload for 3D
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};