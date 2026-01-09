import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// [1] Import Amplify
import { Amplify } from "aws-amplify";

// [2] Configure with your AWS Resource details
// Ideally, use environment variables (import.meta.env.VITE_...) for these values
Amplify.configure({
  Auth: {
    Cognito: {
      // The Identity Pool ID allows unauthenticated (guest) access if configured in AWS
      identityPoolId: "us-east-1:24bca22c-95fc-4a7e-8789-748af317c19d", 
      allowGuestAccess: true 
    }
  },
  Storage: {
    S3: {
      bucket: "youralai-input-videos",
      region: "us-east-1", 
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
