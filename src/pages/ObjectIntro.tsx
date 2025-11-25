import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InstagramStoryTutorial from "@/components/capture/InstagramStoryTutorial";
import OrientationLock from "@/components/OrientationLock";

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
    <>
      <OrientationLock>
        <InstagramStoryTutorial
          isOpen={showTutorial}
          onComplete={handleTutorialComplete}
        />
      </OrientationLock>
    </>
  );
};

export default ObjectIntro;