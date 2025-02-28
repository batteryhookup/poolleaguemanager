
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateLeague from "./pages/CreateLeague";
import LeagueFinder from "./pages/LeagueFinder";
import MyAccount from "./pages/MyAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/poolleaguemanager">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/leagues/new" element={<CreateLeague />} />
          <Route path="/leagues/find" element={<LeagueFinder />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/leagues/*" element={<NotFound />} />
          <Route path="/teams/*" element={<NotFound />} />
          <Route path="/schedule/*" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
