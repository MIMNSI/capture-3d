import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleDashed, Footprints, Scan, Zap } from "lucide-react";

interface TutorialModalProps {
  isOpen: boolean;
  onStart: () => void;
  angle: "middle" | "top" | "bottom";
}

const INSTRUCTIONS = {
  middle: {
    title: "Middle Angle Recording",
    steps: [
      { icon: Scan, text: "Keep phone at chest height" },
      { icon: CircleDashed, text: "Walk around in a full circle" },
      { icon: Zap, text: "Keep the object centered" },
      { icon: Footprints, text: "Maintain a steady walking speed" }
    ]
  },
  top: {
    title: "Top Angle Recording",
    steps: [
      { icon: Scan, text: "Raise phone above the object (~45°)" },
      { icon: CircleDashed, text: "Walk around in a full circle" },
      { icon: Zap, text: "Ensure top surfaces are visible" },
      { icon: Footprints, text: "Keep movements smooth" }
    ]
  },
  bottom: {
    title: "Bottom Angle Recording",
    steps: [
      { icon: Scan, text: "Lower phone below the object (~45°)" },
      { icon: CircleDashed, text: "Walk around in a full circle" },
      { icon: Zap, text: "Capture undercuts and bases" },
      { icon: Footprints, text: "Maintain distance" }
    ]
  }
};

export const TutorialModal = ({ isOpen, onStart, angle }: TutorialModalProps) => {
  const content = INSTRUCTIONS[angle];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onStart()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>Follow these steps for the best 3D result.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex justify-center py-4">
             {/* Simple CSS animation for visual guidance */}
             <div className="w-24 h-24 rounded-full border-4 border-dashed border-primary animate-[spin_10s_linear_infinite] flex items-center justify-center opacity-50">
                <div className="w-12 h-12 bg-primary rounded-full" />
             </div>
          </div>

          <div className="space-y-4">
            {content.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-foreground" />
                </div>
                <p className="text-sm text-foreground/90">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onStart} className="w-full text-lg py-6 font-bold">
            Start Camera
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};