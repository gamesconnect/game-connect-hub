import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EventRegistrationModal } from '@/components/EventRegistrationModal';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [showRegistration, setShowRegistration] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">This event doesn't exist or has been removed.</p>
          <Link to="/events">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <section className="relative pt-16">
        <div className="h-[50vh] relative overflow-hidden">
          <img
            src={event.image_url || 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      </section>

      {/* Event Content */}
      <section className="relative -mt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl shadow-xl p-8 md:p-12">
            {/* Back Link */}
            <Link to="/events" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
            </Link>

            {/* Category & Price */}
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                {event.category}
              </span>
              <span className="bg-muted text-foreground px-4 py-1 rounded-full text-sm font-bold">
                {event.currency} {event.price}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">{event.title}</h1>

            {/* Meta Info */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">
                    {new Date(event.date).toLocaleDateString('en-GB', { 
                      weekday: 'long',
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              {event.time && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <Clock className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold text-foreground">{event.time}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <MapPin className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <Users className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-semibold text-foreground">
                    {event.spots > 0 ? `${event.spots} spots available` : 'Sold Out'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Register Button */}
            <Button 
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-12 border-0"
              onClick={() => setShowRegistration(true)}
              disabled={event.spots <= 0}
            >
              {event.spots <= 0 ? 'Sold Out' : 'Register Now'}
            </Button>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistration && (
        <EventRegistrationModal
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
          eventId={event.id}
        />
      )}

      <Footer />
    </div>
  );
}
