import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X, Image as ImageIcon } from "lucide-react";

interface ExampleCardProps {
  type: "good" | "bad";
  imageSrc?: string; // Optional override for placeholder
}

export const ExampleCard = ({ type, imageSrc }: ExampleCardProps) => {
  const isGood = type === "good";
  
  return (
    <Card className={cn(
      "overflow-hidden border-2 transition-colors",
      isGood ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"
    )}>
      <CardContent className="p-0 relative aspect-video bg-muted/50">
        {imageSrc ? (
          <img src={imageSrc} alt={type} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ImageIcon className="w-8 h-8 opacity-50" />
            <span className="text-xs font-medium">
              {isGood ? "Even Lighting" : "Dark / Blurry"}
            </span>
          </div>
        )}
        
        <div className={cn(
          "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm",
          isGood ? "bg-green-500 text-white" : "bg-red-500 text-white"
        )}>
          {isGood ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {isGood ? "Correct" : "Incorrect"}
        </div>
      </CardContent>
    </Card>
  );
};