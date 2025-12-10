import { RotateCcw } from "lucide-react";

const RotatePrompt = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center text-foreground">
      <img src="https://media.giphy.com/media/3o7TKSjRrfIPjeiVyE/giphy.gif" alt="Rotate device" className="w-48 h-48" />
      <h2 className="text-2xl font-bold mb-2 mt-4">Rotate to start the 3D scanning.</h2>
      <p className="text-muted-foreground">Ensure auto-rotate is enabled</p>
    </div>
  );
};

export default RotatePrompt;