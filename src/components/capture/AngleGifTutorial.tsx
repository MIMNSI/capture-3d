import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Volume2 } from "lucide-react";

interface AngleGifTutorialProps {
  angle: "middle" | "top" | "bottom";
  onStart: () => void;
}

const angleData = {
  middle: {
    title: "Middle Angle",
    subtitle: "Eye-level 360° capture",
    steps: [
      "Keep phone steady at chest height",
      "Walk a full circle around the object",
      "Keep the object centered at all times",
      "Move slowly and smoothly",
    ],
    gifUrl: "/assets/tutorials/middle-angle.gif",
  },
  top: {
    title: "Top Angle",
    subtitle: "High-angle 45° capture",
    steps: [
      "Raise phone above the object",
      "Look down at a 45-degree angle",
      "Walk a full circle around the object",
      "Ensure top surfaces are visible",
    ],
    gifUrl: "/assets/tutorials/top-angle.gif",
  },
  bottom: {
    title: "Bottom Angle",
    subtitle: "Low-angle 45° capture",
    steps: [
      "Lower phone below the object",
      "Look up at a 45-degree angle",
      "Walk a full circle around the object",
      "Capture the base details",
    ],
    gifUrl: "/assets/tutorials/bottom-angle.gif",
  },
};

const AngleGifTutorial = ({ angle, onStart }: AngleGifTutorialProps) => {
  const data = angleData[angle];
  const [tutorialState, setTutorialState] = useState<"idle" | "speaking" | "finished">("idle");

  const speakInstructions = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Clear queue

      const textToSpeak = [
        data.title,
        data.subtitle,
        ...data.steps,
      ].join(". ");

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-US";
      utterance.rate = 1;

      utterance.onstart = () => setTutorialState("speaking");
      utterance.onend = () => setTutorialState("finished");
      utterance.onerror = () => {
        console.error("Speech synthesis error");
        setTutorialState("finished"); // Allow user to proceed even if speech fails
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported.");
      setTutorialState("finished"); // If not supported, just show the button.
    }
  }, [data]);

  useEffect(() => {
    if (screen.orientation && "lock" in screen.orientation) {
      // @ts-ignore
      screen.orientation.lock("landscape").catch(() => {});
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const renderActionButton = () => {
    switch (tutorialState) {
      case "idle":
        return (
          <Button
            onClick={speakInstructions}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg transition-all"
          >
            <Volume2 className="w-5 h-5 mr-2" /> Play Instructions
          </Button>
        );
      case "speaking":
        return (
          <div className="h-14 flex items-center justify-center w-full">
            <p className="text-center text-muted-foreground animate-pulse flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Playing instructions...
            </p>
          </div>
        );
      case "finished":
        return (
          <Button
            onClick={onStart}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Play className="w-5 h-5 mr-2" /> Start Recording
          </Button>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-foreground flex overflow-hidden font-sans">
      
      {/* LEFT PANEL — GIF / PREVIEW */}
      <div className="flex-1 flex items-center justify-center relative p-6">
        
        {/* Cinematic Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/60 to-black/80 pointer-events-none"></div>

        <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] border border-white/10 bg-black">
          
          <img
            src={data.gifUrl}
            alt={`${data.title} tutorial`}
            className="w-full h-full object-cover opacity-95"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%2318181b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2352525b'%3E%F0%9F%8E%A5 Tutorial Demo%3C/text%3E%3C/svg%3E";
            }}
          />

          {/* Label */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-lg text-xs font-mono text-white border border-white/10">
            TUTORIAL PREVIEW
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* RIGHT PANEL — TEXT / STEPS / BUTTON */}
      <div className="w-[420px] max-w-[38%] bg-[#0f0f11] border-l border-white/10 flex flex-col p-10 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="mb-8">
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider inline-flex">
            Step {angle === "middle" ? "1" : angle === "top" ? "2" : "3"} of 3
          </div>

          <h1 className="text-4xl font-bold mt-4 text-white tracking-tight drop-shadow-md">
            {data.title}
          </h1>

          <p className="text-muted-foreground text-lg mt-1">
            {data.subtitle}
          </p>
        </div>

        {/* STEPS */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {data.steps.map((step, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold border border-white/10">
                {index + 1}
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* ACTION BUTTON */}
        <div className="mt-10 pt-6 border-t border-white/10">
          {renderActionButton()}
          <p className="text-center text-xs text-muted-foreground mt-3">
            Recording takes ~30 seconds
          </p>
        </div>

      </div>
    </div>
  );
};

export default AngleGifTutorial;
