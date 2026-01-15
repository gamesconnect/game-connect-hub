import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Trophy, Users, Clock, Gamepad2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/browserClient';
import { EventRegistrationModal } from '@/components/EventRegistrationModal';

const gameDayFeatures = [
  {
    icon: Gamepad2,
    title: 'Multiple Game Stations',
    description: 'From video games to board games, archery to pool - there\'s something for everyone.'
  },
  {
    icon: Trophy,
    title: 'Team Competitions',
    description: 'Join your team and compete for points, prizes, and ultimate bragging rights.'
  },
  {
    icon: Users,
    title: 'Community Bonding',
    description: 'Meet new friends, reconnect with old ones, and build lasting connections.'
  },
  {
    icon: Clock,
    title: 'Full Day of Fun',
    description: 'Non-stop entertainment from morning to evening with breaks for food and drinks.'
  }
];

const pastHighlights = [
  {
    title: 'Cape Coast Games Day',
    date: 'December 2024',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg',
    winner: 'Team Green',
    participants: 45
  },
  {
    title: 'Accra Game Night',
    date: 'November 2024',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg',
    winner: 'Team Blue',
    participants: 32
  },
  {
    title: 'Kumasi Adventure Day',
    date: 'October 2024',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg',
    winner: 'Team Red',
    participants: 38
  }
];

export default function GameDay() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch Game Day events from the database
  const { data: gameDayEvents, isLoading } = useQuery({
    queryKey: ['game-day-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'Game Day')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-black mb-4">
              Game <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Day</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              The ultimate day of competition, fun, and team spirit. Join us for an unforgettable experience!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-4">What to Expect</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Game Day is our signature event where teams compete, friends connect, and memories are made.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameDayFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Game Days */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-4">Upcoming Game Days</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't miss out on our next big event!
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : gameDayEvents && gameDayEvents.length > 0 ? (
            <div className="space-y-8">
              {gameDayEvents.map((gameDay) => (
                <div
                  key={gameDay.id}
                  className="bg-card rounded-3xl overflow-hidden shadow-lg grid md:grid-cols-2"
                >
                  <img
                    src={gameDay.image_url || 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/cape-coast-flyer_bqx8md.jpg'}
                    alt={gameDay.title}
                    className="w-full h-full object-cover min-h-[300px]"
                  />
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-foreground mb-4">{gameDay.title}</h3>
                    
                    {gameDay.description && (
                      <p className="text-muted-foreground mb-4">{gameDay.description}</p>
                    )}
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>{new Date(gameDay.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {gameDay.time && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-5 h-5 text-secondary" />
                          <span>{gameDay.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-5 h-5 text-accent" />
                        <span>{gameDay.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-5 h-5 text-green-500" />
                        <span>{gameDay.spots} spots available</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-2xl font-bold text-primary">
                        {gameDay.currency} {gameDay.price}
                      </span>
                    </div>

                    <Button 
                      className="w-fit bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-8 border-0"
                      onClick={() => setSelectedEventId(gameDay.id)}
                      disabled={gameDay.spots <= 0}
                    >
                      {gameDay.spots <= 0 ? 'Sold Out' : 'Register Now'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-3xl">
              <p className="text-muted-foreground text-lg mb-4">No upcoming Game Days scheduled yet.</p>
              <Link to="/events">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-8 border-0">
                  View All Events
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {selectedEventId && (
        <EventRegistrationModal
          isOpen={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
          eventId={selectedEventId}
        />
      )}

      {/* Past Highlights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-4">Past Highlights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Relive the excitement from our previous Game Days
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pastHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={highlight.image}
                    alt={highlight.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {highlight.winner}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-foreground mb-2">{highlight.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{highlight.date}</span>
                    <span>{highlight.participants} participants</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready for Game Day?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join your team, compete in epic challenges, and make memories that last a lifetime!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/teams">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8 shadow-lg">
                Choose Your Team
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}