import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AngleGifTutorialProps {
  angle: "middle" | "top" | "bottom";
  onStart: () => void;
}

const angleData = {
  middle: {
    title: "Middle Angle",
    subtitle: "Walk 360° around the object",
    instructions: [
      "Keep phone at eye level",
      "Maintain same distance from object",
      "Walk slowly in a complete circle",
      "Keep object centered in frame"
    ],
    // Placeholder: Replace with actual GIF path when available
    gifUrl: "/assets/tutorials/middle-angle.gif",
    color: "from-blue-600 to-blue-800"
  },
  top: {
    title: "Top Angle",
    subtitle: "Record from above the object",
    instructions: [
      "Raise camera above object",
      "Look down at 45° angle",
      "Walk in a circle around object",
      "Keep object fully visible"
    ],
    gifUrl: "/assets/tutorials/top-angle.gif",
    color: "from-purple-600 to-purple-800"
  },
  bottom: {
    title: "Bottom Angle",
    subtitle: "Record from below the object",
    instructions: [
      "Lower camera below object",
      "Look up at 45° angle",
      "Walk in a circle around object",
      "Capture underside details"
    ],
    gifUrl: "/assets/tutorials/bottom-angle.gif",
    color: "from-green-600 to-green-800"
  }
};

const AngleGifTutorial = ({ angle, onStart }: AngleGifTutorialProps) => {
  const data = angleData[angle];

  useEffect(() => {
    // Lock screen to portrait for tutorial
    if (screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as any).lock("portrait").catch(() => {
        console.log("Screen orientation lock not supported");
      });
    }
  }, []);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${data.color} z-50 flex flex-col text-white`}>
      {/* Header */}
      <div className="p-4 sm:p-6 text-center border-b border-white/20 bg-black/20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{data.title}</h1>
        <p className="text-sm sm:text-base md:text-lg text-white/80">{data.subtitle}</p>
      </div>

      {/* GIF Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md aspect-video bg-black/30 rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/20">
          {/* Placeholder for GIF - will show image if exists, otherwise placeholder */}
          <img 
            src={data.gifUrl} 
            alt={`${data.title} tutorial`}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to placeholder if GIF not found
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='400' height='225' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%23fff'%3E%F0%9F%8E%A5 Tutorial Animation%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Instructions */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 shadow-xl">
            <h3 className="text-white font-bold text-lg sm:text-xl mb-4">Instructions:</h3>
            <ul className="space-y-3">
              {data.instructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="p-4 sm:p-6 bg-black/20 border-t border-white/20">
        <Button 
          onClick={onStart}
          size="lg"
          className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold bg-white text-gray-900 hover:bg-white/90 shadow-xl"
        >
          Start Recording (30 seconds)
        </Button>
        <p className="text-center text-xs sm:text-sm text-white/60 mt-3">
          Camera will open in landscape mode
        </p>
      </div>
    </div>
  );
};

export default AngleGifTutorial;
