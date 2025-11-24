import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InstagramStoryTutorial from "@/components/capture/InstagramStoryTutorial";

const ObjectIntro = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(true);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // Navigate to record flow after tutorial
    setTimeout(() => {
      navigate("/record");
    }, 300);
  };

  return (
    <InstagramStoryTutorial
      isOpen={showTutorial}
      onComplete={handleTutorialComplete}
    />
  );
};

export default ObjectIntro;