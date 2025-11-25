import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/formatTime";

interface AngleHeaderProps {
  currentAngle: number; // 1, 2, or 3
  totalAngles?: number;
  elapsed: number;
  status: string;
}

export const AngleHeader = ({ currentAngle, totalAngles = 3, elapsed, status }: AngleHeaderProps) => {
  const titles = ["Middle Angle", "Top Angle", "Bottom Angle"];

  return (
    <div className="w-full py-4 sticky top-0 z-50">
      <div className="container max-w-md mx-auto flex flex-col items-center justify-center px-4">
        
        {/* Progress Bars */}
        <div className="flex gap-2 mb-2">
          {Array.from({ length: totalAngles }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-8 rounded-full transition-colors duration-300",
                i + 1 === currentAngle
                  ? "bg-primary"
                  : i + 1 < currentAngle
                  ? "bg-primary/50"
                  : "bg-secondary"
              )}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {titles[currentAngle - 1] || "Recording"}
        </h2>

        {/* Timer */}
        <div className={cn(
          "font-mono text-xl font-bold tabular-nums px-4 py-1 rounded-full shadow-lg transition-colors border border-white/10 mt-2",
          status === "recording"
            ? "bg-red-600/90 text-white animate-pulse"
            : "bg-black/40 text-white backdrop-blur-md"
        )}>
          {formatTime(elapsed)}
        </div>
      </div>
    </div>
  );
};
