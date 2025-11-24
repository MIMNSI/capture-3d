import { useState, useEffect, useRef } from "react";
import { Check, Volume2, VolumeX } from "lucide-react";

interface RecordingRoundProps {
  round: number;
  onComplete: (blob: Blob) => void; // UPDATED: Now accepts a blob
  stream: MediaStream | null;
}

const roundInstructions = {
  1: "Middle Angle: Walk 360° around object",
  2: "High Angle: Raise camera, look down",
  3: "Low Angle: Lower camera, look up"
};

const RecordingRound = ({ round, onComplete, stream }: RecordingRoundProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showComplete, setShowComplete] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null); // Store the blob locally first

  // Audio Instruction Logic
  useEffect(() => {
    if (!audioEnabled) return;
    window.speechSynthesis.cancel();
    const text = roundInstructions[round as keyof typeof roundInstructions];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [round, audioEnabled]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRecording && timeLeft === 0) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || "";
  };

  const startRecording = () => {
    if (!stream) return;
    window.speechSynthesis.cancel();

    try {
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      chunksRef.current = []; // Reset chunks

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        setRecordedBlob(blob); // Save blob to state
        setShowComplete(true);
        
        // Wait briefly to show success message, then pass blob to parent
        setTimeout(() => {
          onComplete(blob); 
        }, 2000);
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      alert("Failed to start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (showComplete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in z-20">
        <div className="text-center space-y-4 p-8 bg-black/40 rounded-2xl border border-green-500/50">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)]">
            <Check className="w-10 h-10 text-black" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-white">Round {round} Saved!</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Instruction Banner */}
      <div className="absolute top-20 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-10">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 animate-fade-in flex items-center gap-3 pointer-events-auto">
          <p className="text-white font-medium text-center text-shadow-sm text-sm md:text-base">
            <span className="text-neon font-bold mr-2">ROUND {round}:</span> 
            {roundInstructions[round as keyof typeof roundInstructions]}
          </p>
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-neon" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>
        </div>
      </div>

      {/* Timer HUD */}
      {isRecording && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-white drop-shadow-md font-mono">
                {timeLeft}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center justify-end pointer-events-auto bg-gradient-to-t from-black/90 via-black/40 to-transparent min-h-[200px]">
        {!isRecording ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-transparent border-4 border-white flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
            </button>
            <p className="text-white/80 font-medium bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">
              Tap to Start Round {round}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95"
            >
              <div className="w-10 h-10 rounded-md bg-red-500" />
            </button>
            <p className="text-white/80 font-medium">Recording...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default RecordingRound;