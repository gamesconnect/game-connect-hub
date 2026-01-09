import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { EventsManager } from '@/components/admin/EventsManager';
import { RegistrationsManager } from '@/components/admin/RegistrationsManager';
import { TeamMembersManager } from '@/components/admin/TeamMembersManager';
import { BlogPostsManager } from '@/components/admin/BlogPostsManager';
import { ContactMessagesManager } from '@/components/admin/ContactMessagesManager';
import { NewsletterSubscribersManager } from '@/components/admin/NewsletterSubscribersManager';
import { Loader2, LogOut, Calendar, Users, ClipboardList, LayoutDashboard, FileText, MessageSquare, Mail, BarChart3 } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      navigate('/');
    }
  }, [user, isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-orange-400" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="registrations" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Registrations</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="events">
            <EventsManager />
          </TabsContent>

          <TabsContent value="registrations">
            <RegistrationsManager />
          </TabsContent>

          <TabsContent value="team">
            <TeamMembersManager />
          </TabsContent>

          <TabsContent value="blog">
            <BlogPostsManager />
          </TabsContent>

          <TabsContent value="messages">
            <ContactMessagesManager />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterSubscribersManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
