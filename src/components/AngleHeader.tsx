import { cn } from "@/lib/utils";

interface AngleHeaderProps {
  currentAngle: number; // 1, 2, or 3
  totalAngles?: number;
}

export const AngleHeader = ({ currentAngle, totalAngles = 3 }: AngleHeaderProps) => {
  const titles = ["Middle Angle", "Top Angle", "Bottom Angle"];
  
  return (
    <div className="w-full py-4 bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
      <div className="container max-w-md mx-auto flex flex-col items-center justify-center px-4">
        <div className="flex gap-2 mb-2">
          {Array.from({ length: totalAngles }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-1.5 w-8 rounded-full transition-colors duration-300",
                i + 1 === currentAngle ? "bg-primary" : 
                i + 1 < currentAngle ? "bg-primary/50" : "bg-secondary"
              )}
            />
          ))}
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {titles[currentAngle - 1] || "Recording"}
        </h2>
      </div>
    </div>
  );
};