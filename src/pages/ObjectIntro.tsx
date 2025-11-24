import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExampleCard } from "@/components/ExampleCard";
import { StudyTimer } from "@/components/StudyTimer";
import { ArrowLeft } from "lucide-react";

const ObjectIntro = () => {
  const navigate = useNavigate();
  const [hasStudied, setHasStudied] = useState(false);
  const [isStudying, setIsStudying] = useState(false);

  const startStudy = () => setIsStudying(true);
  
  const handleStudyComplete = () => {
    setIsStudying(false);
    setHasStudied(true);
  };

  const handleStartFlow = () => {
    navigate("/record");
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24 relative">
      {/* Nav Back */}
      <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mb-4">
        <ArrowLeft className="w-6 h-6" />
      </Button>

      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Before you start</h1>
          <p className="text-muted-foreground">
            Lighting is key. Ensure your object is well-lit and you can move freely around it.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ExampleCard type="good" />
          <ExampleCard type="bad" />
        </div>

        {/* Action Area */}
        <div className="pt-8 space-y-4">
          {!isStudying && !hasStudied && (
            <Button onClick={startStudy} className="w-full text-lg h-14 font-semibold">
              I'm Ready to Learn
            </Button>
          )}

          {isStudying && (
            <StudyTimer onComplete={handleStudyComplete} />
          )}

          {hasStudied && (
            <Button 
              onClick={handleStartFlow} 
              className="w-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              Start Recording
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectIntro;