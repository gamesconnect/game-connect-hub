import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Star, Target, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Teams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);

  // Fetch teams with stats and achievements
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams-with-details'],
    queryFn: async () => {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (teamsError) throw teamsError;

      const { data: statsData, error: statsError } = await supabase
        .from('team_stats')
        .select('*');
      
      if (statsError) throw statsError;

      const { data: achievementsData, error: achievementsError } = await supabase
        .from('team_achievements')
        .select('*');
      
      if (achievementsError) throw achievementsError;

      return teamsData.map(team => ({
        ...team,
        stats: statsData.find(s => s.team_id === team.id) || { wins: 0, members_count: 0 },
        achievements: achievementsData.filter(a => a.team_id === team.id).map(a => a.achievement)
      }));
    },
  });

  // Fetch user's current team membership
  const { data: userMembership } = useQuery({
    queryKey: ['user-team-membership', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('team_memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      // If already in a team, leave first
      if (userMembership) {
        const { error: deleteError } = await supabase
          .from('team_memberships')
          .delete()
          .eq('user_id', user.id);
        if (deleteError) throw deleteError;
      }

      const { error } = await supabase
        .from('team_memberships')
        .insert({ user_id: user.id, team_id: teamId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-team-membership'] });
      queryClient.invalidateQueries({ queryKey: ['teams-with-details'] });
      toast({
        title: 'Team Joined!',
        description: 'Welcome to the team! Get ready to compete.',
      });
      setJoiningTeamId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Join Team',
        description: error.message,
        variant: 'destructive',
      });
      setJoiningTeamId(null);
    },
  });

  const handleJoinTeam = (teamId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to join a team.',
      });
      navigate('/auth');
      return;
    }
    setJoiningTeamId(teamId);
    joinTeamMutation.mutate(teamId);
  };

  const getColorClasses = (colorFrom: string, colorTo: string) => {
    return `from-${colorFrom} to-${colorTo}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-black mb-4">
              Choose Your <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Team</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join one of our four legendary teams and compete for glory, prizes, and eternal bragging rights!
            </p>
            {userMembership && teams && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span className="text-white/80">You're on:</span>
                <span className="font-bold text-white">
                  {teams.find(t => t.id === userMembership.team_id)?.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {teams?.map((team) => {
                const isUserTeam = userMembership?.team_id === team.id;
                const isJoining = joiningTeamId === team.id;
                
                return (
                  <div
                    key={team.id}
                    className={`rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${team.border_color} ${team.bg_color} ${isUserTeam ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-6xl">{team.emoji}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-3xl font-black bg-gradient-to-r from-${team.color_from} to-${team.color_to} bg-clip-text text-transparent`}>
                              {team.name}
                            </h3>
                            {isUserTeam && (
                              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Your Team</span>
                            )}
                          </div>
                          <p className="text-lg text-muted-foreground">{team.tagline}</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6">{team.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-card rounded-2xl p-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="text-2xl font-bold text-foreground">{team.stats.members_count}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Members</p>
                        </div>
                        <div className="bg-card rounded-2xl p-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="text-2xl font-bold text-foreground">{team.stats.wins}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Wins</p>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Achievements
                        </h4>
                        <ul className="space-y-2">
                          {team.achievements.map((achievement: string) => (
                            <li key={achievement} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Target className="w-3 h-3 text-primary" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        className={`w-full bg-gradient-to-r from-${team.color_from} to-${team.color_to} hover:opacity-90 text-white rounded-full border-0`}
                        onClick={() => handleJoinTeam(team.id)}
                        disabled={isJoining || isUserTeam}
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : isUserTeam ? (
                          'Your Current Team'
                        ) : userMembership ? (
                          `Switch to ${team.name}`
                        ) : (
                          `Join ${team.name}`
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-foreground mb-4">
            How Teams Work
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            When you join an event, you'll be assigned to a team. Compete in games and activities to earn points for your team. 
            The team with the most points at the end of each event wins prizes!
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-foreground mb-2">Compete</h3>
              <p className="text-sm text-muted-foreground">Win games and challenges to earn points for your team</p>
            </div>
            <div className="bg-card rounded-2xl p-6">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold text-foreground mb-2">Collaborate</h3>
              <p className="text-sm text-muted-foreground">Work with teammates to strategize and dominate</p>
            </div>
            <div className="bg-card rounded-2xl p-6">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-bold text-foreground mb-2">Celebrate</h3>
              <p className="text-sm text-muted-foreground">Win amazing prizes and earn bragging rights</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}