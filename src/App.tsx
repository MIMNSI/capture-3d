import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ObjectIntro from "./pages/ObjectIntro";
import RecordFlow from "./pages/RecordFlow";
import NotFound from "./pages/NotFound";
import OrientationLock from "./components/OrientationLock";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* CHANGED: Root path now renders ObjectIntro directly, skipping the Home/Landing page */}
          <Route path="/" element={<ObjectIntro />} />
          
          {/* Optional: Keep Home accessible via specific route if needed later */}
          <Route path="/home" element={<Home />} />
          
          <Route path="/object-intro" element={<ObjectIntro />} />
          <Route path="/record" element={<OrientationLock><RecordFlow /></OrientationLock>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;