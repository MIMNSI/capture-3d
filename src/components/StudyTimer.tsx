import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface StudyTimerProps {
  duration?: number; // seconds
  onComplete: () => void;
}

export const StudyTimer = ({ duration = 3, onComplete }: StudyTimerProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const elapsed = duration * 1000 - remaining;
      const pct = (elapsed / (duration * 1000)) * 100;

      setProgress(pct);

      if (now >= endTime) {
        clearInterval(interval);
        setProgress(100);
        onComplete();
      }
    }, 20); // Update every 20ms for smooth animation

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="w-full space-y-2 animate-in fade-in duration-300">
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>Studying examples...</span>
        <span>{Math.min(100, Math.round(progress))}%</span>
      </div>
      <Progress value={progress} className="h-2 bg-secondary" />
    </div>
  );
};