import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Navigation } from "./components/Navigation";
import HomePage from "./pages/HomePage";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Teams from "./pages/Teams";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import GameDay from "./pages/GameDay";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import RegistrationConfirmation from "./pages/RegistrationConfirmation";
import PaymentPending from "./pages/PaymentPending";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Main Site Layout Component
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navigation />
    {children}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
            <Route path="/events/:id" element={<MainLayout><EventDetail /></MainLayout>} />
            <Route path="/teams" element={<MainLayout><Teams /></MainLayout>} />
            <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
            <Route path="/blog/:id" element={<MainLayout><BlogPost /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
            <Route path="/game-day" element={<MainLayout><GameDay /></MainLayout>} />
            <Route path="/registration/:id" element={<MainLayout><RegistrationConfirmation /></MainLayout>} />
            <Route path="/payment-pending/:id" element={<MainLayout><PaymentPending /></MainLayout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/check-in" element={<CheckIn />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
