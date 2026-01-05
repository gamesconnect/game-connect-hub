import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const events = [
  {
    id: '1',
    title: 'Akosombo Games Day',
    date: '2025-06-14',
    location: 'Akosombo, Ghana',
    time: '7:00 AM - 6:00 PM',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/cape-coast-flyer_bqx8md.jpg',
    description: 'An action-packed day trip featuring outdoor games, team competitions, and boat activities at beautiful Lake Volta.',
    category: 'Travel',
    spots: 50,
    price: 'GHS 350'
  },
  {
    id: '2',
    title: 'Friday Game Night',
    date: '2025-02-07',
    location: 'Accra, Ghana',
    time: '6:00 PM - 10:00 PM',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg',
    description: 'Join us for an exciting evening of board games, video games, and fun competitions with prizes!',
    category: 'Gaming',
    spots: 30,
    price: 'GHS 50'
  },
  {
    id: '3',
    title: 'Cape Coast Adventure',
    date: '2025-03-15',
    location: 'Cape Coast, Ghana',
    time: 'Full Day',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg',
    description: 'Explore the historic Cape Coast Castle, Kakum National Park canopy walkway, and enjoy beach activities.',
    category: 'Travel',
    spots: 40,
    price: 'GHS 500'
  }
];

export default function Events() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-black mb-4">
              Upcoming <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Events</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join us for exciting adventures, game nights, and community events. There's something for everyone!
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-foreground px-3 py-1 rounded-full text-sm font-bold">
                      {event.price}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">{event.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>{event.spots} spots available</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full border-0">
                    Register Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-foreground mb-4">
            Don't Miss Out on the Fun!
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our WhatsApp community to get notified about new events and exclusive early-bird offers.
          </p>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
            onClick={() => window.open('https://chat.whatsapp.com/LT0Zolnz9fMLm7b7aKtQld', '_blank')}
          >
            Join WhatsApp Group
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
