import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: '1',
    title: 'Top 10 Games to Play at Your Next Game Night',
    excerpt: 'From classic board games to modern party favorites, here are the best games to bring people together and create unforgettable memories.',
    date: '2025-01-15',
    author: 'Games & Connect Team',
    category: 'Gaming',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Exploring Ghana: Hidden Gems You Must Visit',
    excerpt: 'Discover the lesser-known destinations across Ghana that offer incredible experiences for adventure seekers and culture enthusiasts.',
    date: '2025-01-10',
    author: 'Games & Connect Team',
    category: 'Travel',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Building Meaningful Connections in the Digital Age',
    excerpt: 'How in-person events and shared experiences create deeper friendships than social media ever could.',
    date: '2025-01-05',
    author: 'Games & Connect Team',
    category: 'Community',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg',
    readTime: '6 min read'
  },
  {
    id: '4',
    title: 'Cape Coast Adventure Recap: A Day to Remember',
    excerpt: 'Relive the highlights from our recent Cape Coast adventure, featuring the Kakum canopy walkway and beach activities.',
    date: '2024-12-28',
    author: 'Games & Connect Team',
    category: 'Events',
    image: 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg',
    readTime: '4 min read'
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-black mb-4">
              Our <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Stories, tips, and insights from the Games & Connect community
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          <div className="mb-16">
            <div className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 grid md:grid-cols-2">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-full object-cover min-h-[300px]"
              />
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4 w-fit">
                  {blogPosts[0].category}
                </span>
                <h2 className="text-3xl font-black text-foreground mb-4">{blogPosts[0].title}</h2>
                <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                </div>
                <Button className="w-fit bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-6 border-0">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Other Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <div
                key={post.id}
                className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-foreground mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get the latest stories, event announcements, and community updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-8 border-0">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
