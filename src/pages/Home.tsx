import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Box, Map } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Capture 3D
          </h1>
          <p className="text-muted-foreground">
            Turn physical objects into digital 3D models.
          </p>
        </div>

        {/* Selection Buttons */}
        <div className="grid gap-4">
          <Button 
            onClick={() => navigate("/object-intro")}
            className="h-32 flex flex-col gap-3 bg-card hover:bg-accent/10 border-2 border-border hover:border-primary group transition-all relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform z-10">
              <Box className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center z-10">
              <span className="text-xl font-bold block text-foreground">Object Mode</span>
              <span className="text-sm text-muted-foreground">Small items, furniture, toys</span>
            </div>
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>

          <Button 
            disabled
            className="h-32 flex flex-col gap-3 bg-card/50 border-2 border-border/50 opacity-60 cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Map className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <span className="text-xl font-bold block text-muted-foreground">Scene Mode</span>
              <span className="text-sm text-muted-foreground">Rooms, outdoors (Coming Soon)</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;