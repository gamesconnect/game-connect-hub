import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Plane, Gamepad2 } from 'lucide-react';
import { useTypingEffect } from '@/hooks/use-typing-effect';
import { Footer } from '@/components/Footer';

// Sample data for upcoming events
const sampleEvents = [
  {
    id: '1',
    title: 'Akosombo Games Day',
    date: '2025-06-14',
    location: 'Akosombo, Ghana',
    image_url: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/cape-coast-flyer_bqx8md.jpg',
    description: 'An action-packed day trip featuring outdoor games, team competitions, and boat activities at beautiful Lake Volta.'
  }
];

// Image sets for hero rotation
const imageSets = [
  [
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg"
  ],
  [
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1344_y4iq2a.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1414_ij80mu.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1679_ovnanp.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1684_pv0ohb.jpg"
  ],
  [
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1656_yoiklo.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1677_v8n5nu.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1758_mj5kho.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1776_eob5jv.jpg"
  ]
];

// Games list
const games = [
  { name: 'Archery', emoji: '🏹', level: 'Intermediate' },
  { name: 'Card Games', emoji: '🃏', level: 'Beginner' },
  { name: 'Darts', emoji: '🎯', level: 'Beginner' },
  { name: 'Football', emoji: '⚽', level: 'Intermediate' },
  { name: 'Chess', emoji: '♟️', level: 'Advanced' },
  { name: 'Pool', emoji: '🎱', level: 'Intermediate' },
  { name: 'Table Tennis', emoji: '🏓', level: 'Beginner' },
  { name: 'Video Games', emoji: '🎮', level: 'All Levels' },
  { name: 'UNO', emoji: '🎴', level: 'Beginner' },
  { name: 'Volleyball', emoji: '🏐', level: 'Intermediate' },
  { name: 'Trivia', emoji: '🧠', level: 'Beginner' },
  { name: 'Karaoke', emoji: '🎤', level: 'Beginner' },
];

// Teams data
const teams = [
  { name: 'Team Red', emoji: '🔥', tagline: 'Fire & Passion', members: 485, wins: 127, color: 'from-red-500 to-red-600', path: '/teams' },
  { name: 'Team Yellow', emoji: '⚡', tagline: 'Lightning Speed', members: 423, wins: 134, color: 'from-yellow-400 to-yellow-500', path: '/teams' },
  { name: 'Team Green', emoji: '🌿', tagline: "Nature's Force", members: 467, wins: 119, color: 'from-green-500 to-green-600', path: '/teams' },
  { name: 'Team Blue', emoji: '🌊', tagline: 'Ocean Deep', members: 512, wins: 142, color: 'from-blue-500 to-blue-600', path: '/teams' },
];

// Gallery images
const galleryImages = [
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1344_y4iq2a.jpg', alt: 'Community Event' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1679_ovnanp.jpg', alt: 'Group Activity' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1684_pv0ohb.jpg', alt: 'Team Building' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1414_ij80mu.jpg', alt: 'Social Gathering' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg', alt: 'Team Red Champions' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg', alt: 'Team Green Adventure' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg', alt: 'Team Blue Victory' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg', alt: 'Team Yellow in Action' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1424_f0harp.jpg', alt: 'Event Highlights' },
  { src: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1623_olhksw.jpg', alt: 'Community Fun' },
];

// Testimonials
const testimonials = [
  {
    name: 'Adjoa K.',
    role: 'Adventure Enthusiast',
    category: 'TRAVEL',
    avatar: '👩🏿‍💻',
    quote: "Games & Connect opened my eyes to a whole new Ghana. From Cape Coast to Kumasi, every adventure teaches me something new about my country and myself."
  },
  {
    name: 'Kojo M.',
    role: 'Tournament Champion',
    category: 'PLAY',
    avatar: '👨🏿‍🎨',
    quote: "I thought I was good at games until I joined G&C! The competition pushed me to my limits, and I've made amazing friends along the way."
  },
  {
    name: 'Efua A.',
    role: 'Community Leader',
    category: 'CONNECT',
    avatar: '👩🏿‍🚀',
    quote: "This community changed my life. I've met my best friends here and found a family that truly cares. G&C is where connections become family."
  },
];

export default function HomePage() {
  const [currentImageSet, setCurrentImageSet] = useState(0);
  const nextEvent = sampleEvents[0];

  // Typing effect for the hero header
  const { displayedText: typedText, isTyping } = useTypingEffect({
    text: "Play.\nTravel.\nConnect.",
    speed: 150,
    delay: 800
  });

  // Image rotation effect
  useEffect(() => {
    const imageRotationTimer = setInterval(() => {
      setCurrentImageSet((prev) => (prev + 1) % imageSets.length);
    }, 4000);

    return () => clearInterval(imageRotationTimer);
  }, []);

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        {/* Logo-inspired gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-blue-500/10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            {/* Left side - Text content */}
            <div className="animate-in slide-in-from-left duration-700">
              <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
                {typedText.split('\n').map((line, index) => (
                  <div key={index}>
                    {line === 'Travel.' ? (
                      <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{line}</span>
                    ) : (
                      line
                    )}
                    {index < typedText.split('\n').length - 1 && <br />}
                  </div>
                ))}
                {isTyping && (
                  <span className="inline-block w-1 h-16 lg:h-20 bg-gradient-to-b from-orange-400 to-red-500 ml-2 animate-pulse" />
                )}
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
                Join a growing community of young Ghanaians making memories through fun, adventure, and connection. Experience our exciting events, travel adventures, and build lasting friendships.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/events">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full shadow-lg shadow-orange-500/25 border-0"
                  >
                    Join the Journey
                  </Button>
                </Link>
                <Link to="/events">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-blue-400/50 text-blue-200 hover:bg-blue-500/10 hover:border-blue-400 px-8 py-3 rounded-full"
                  >
                    Explore Events
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-purple-400/50 text-purple-200 hover:bg-purple-500/10 hover:border-purple-400 px-8 py-3 rounded-full"
                  >
                    Read Our Blog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Image grid */}
            <div className="relative hidden lg:block animate-in slide-in-from-right duration-700">
              <div className="grid grid-cols-2 gap-6">
                {/* Top left - Large image */}
                <div className="col-span-1 row-span-2">
                  <img
                    key={`main-${currentImageSet}`}
                    src={imageSets[currentImageSet][0]}
                    alt="Community event"
                    className="w-full h-full object-cover rounded-2xl shadow-lg transition-all duration-500"
                  />
                </div>

                {/* Top right - Event image */}
                <div className="col-span-1">
                  <img
                    key={`top-${currentImageSet}`}
                    src={imageSets[currentImageSet][1]}
                    alt="Event activity"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg transition-all duration-500"
                  />
                </div>

                {/* Bottom right - Activity image */}
                <div className="col-span-1">
                  <img
                    key={`bottom-${currentImageSet}`}
                    src={imageSets[currentImageSet][2]}
                    alt="Group activity"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg transition-all duration-500"
                  />
                </div>
              </div>

              {/* Bottom full-width image */}
              <div className="mt-6">
                <img
                  key={`full-${currentImageSet}`}
                  src={imageSets[currentImageSet][3]}
                  alt="Team building event"
                  className="w-full h-40 object-cover rounded-2xl shadow-lg transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Event Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              {/* Event Flyer */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                <img
                  src={nextEvent.image_url}
                  alt={`${nextEvent.title} Flyer`}
                  className="w-full h-full object-cover aspect-[4/5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
                <div className="absolute top-6 right-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-orange-500/30 animate-pulse-glow">
                    GET TICKETS
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <span className="text-sm font-medium">{nextEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">{nextEvent.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
                NEXT ADVENTURE
              </div>

              <h2 className="text-5xl font-black text-foreground mb-6">
                {nextEvent.title.split(' ').map((word, index, array) =>
                  index === array.length - 1 ? (
                    <span key={index} className="text-primary">{word}</span>
                  ) : (
                    word + ' '
                  )
                )}
              </h2>

              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {nextEvent.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">Gaming Tournaments & Competitions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Plane className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-foreground">Weekend Getaways & Adventures</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">Community Bonding & Networking</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/events">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-8 border-0">
                    Explore Events
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="rounded-full px-8 border-primary/50 text-primary hover:bg-primary/10">
                    Ask Questions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4">Our Three Pillars</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything we do is built around our core philosophy: Play, Travel, and Connect
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Play */}
            <div className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-primary mb-2">PLAY</h3>
              <h4 className="text-lg font-semibold text-foreground mb-4">Gaming & Entertainment</h4>
              <p className="text-muted-foreground mb-6">
                From tournaments to casual game nights, we celebrate the joy of play in all its forms.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Gaming Tournaments</li>
                <li>• Board Games</li>
                <li>• Video Games</li>
                <li>• Card Games</li>
              </ul>
            </div>

            {/* Travel */}
            <div className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold text-secondary mb-2">TRAVEL</h3>
              <h4 className="text-lg font-semibold text-foreground mb-4">Adventures & Exploration</h4>
              <p className="text-muted-foreground mb-6">
                Discover Ghana's hidden gems and beyond with fellow adventurers who share your wanderlust.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Cape Coast Tours</li>
                <li>• Cultural Sites</li>
                <li>• Beach Adventures</li>
                <li>• Historical Exploration</li>
              </ul>
            </div>

            {/* Connect */}
            <div className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-accent mb-2">CONNECT</h3>
              <h4 className="text-lg font-semibold text-foreground mb-4">Community & Relationships</h4>
              <p className="text-muted-foreground mb-6">
                Build meaningful friendships and professional networks in Ghana's most welcoming community.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Networking Events</li>
                <li>• Skill Workshops</li>
                <li>• WhatsApp Community</li>
                <li>• Social Gatherings</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Games Collection Section */}
      <section className="py-20 bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <h2 className="text-4xl font-black text-foreground mb-4">Our Games Collection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our variety of exciting games and activities for all skill levels
            </p>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative">
          <div className="flex animate-marquee">
            {[...games, ...games].map((game, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-4 bg-card rounded-2xl p-6 shadow-md w-48 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{game.emoji}</div>
                <h3 className="font-semibold text-foreground mb-1">{game.name}</h3>
                <span className="text-sm text-muted-foreground">{game.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/events">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-8 border-0">
              Join Our Next Game Night
            </Button>
          </Link>
        </div>
      </section>

      {/* Teams Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4">Choose Your Team</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join one of our four legendary teams and compete for glory, prizes, and bragging rights!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teams.map((team) => (
              <div
                key={team.name}
                className="bg-card rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{team.emoji}</div>
                <h3 className={`text-xl font-bold bg-gradient-to-r ${team.color} bg-clip-text text-transparent mb-1`}>
                  {team.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{team.tagline}</p>
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="font-bold text-foreground">Members:</span>
                    <span className="text-muted-foreground ml-1">{team.members}</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">Wins:</span>
                    <span className="text-muted-foreground ml-1">{team.wins}</span>
                  </div>
                </div>
                <Link to={team.path}>
                  <Button variant="outline" className="w-full rounded-full">
                    View Team
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Can't decide? Don't worry - you can switch teams anytime before major tournaments!
            </p>
            <Link to="/teams">
              <Button variant="outline" className="rounded-full px-8">
                View All Teams
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-foreground mb-4">Our Gallery</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Capturing unforgettable moments from our adventures and events
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`relative rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 ${
                  index === 0 || index === 5 ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                    {image.alt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">By The Numbers</h2>
            <p className="text-white/70 text-lg">
              Our community continues to grow stronger every day
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                200+
              </div>
              <div className="text-white/70 mt-2">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                24+
              </div>
              <div className="text-white/70 mt-2">Events Organized</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                4
              </div>
              <div className="text-white/70 mt-2">Team Colors</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-white/70 mt-2">Fun Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4">What Our Community Says</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real stories from real people in our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-4">{testimonial.avatar}</div>
                <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{testimonial.role}</p>
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4">
                  {testimonial.category}
                </span>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to Play, Travel & Connect?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join Ghana's most vibrant community where every day is an adventure, every game is a lesson, and every connection is a new beginning.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/events">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8 shadow-lg">
                Join the Adventure
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8"
              onClick={() => window.open('https://chat.whatsapp.com/LT0Zolnz9fMLm7b7aKtQld', '_blank')}
            >
              Join WhatsApp Group
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
