import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Calendar, Trophy, Users, BookOpen, Mail, LogIn, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Game Day', path: '/game-day', icon: Trophy },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Blog', path: '/blog', icon: BookOpen },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition-opacity duration-300"
          >
            <img
              src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1756502369/games_logo_1_gbimmw.svg"
              alt="Games & Connect Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'text-orange-400 font-semibold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.name.toUpperCase()}
              </Link>
            ))}
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link to="/admin">
                  <Button size="sm" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                    <Settings className="w-4 h-4 mr-1" /> Admin
                  </Button>
                </Link>
              )}
              {user ? (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => signOut()}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth">
                  <Button size="sm" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                    <LogIn className="w-4 h-4 mr-1" /> Login
                  </Button>
                </Link>
              )}
              <Link to="/events">
                <Button size="sm" className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25 text-white border-0">
                  Join the Journey
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'text-orange-400 font-semibold'
                      : 'text-white/80 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name.toUpperCase()}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-white/80 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 inline mr-2" /> Admin Dashboard
                </Link>
              )}
              <div className="px-3 py-2 space-y-2">
                {user ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => { signOut(); setIsOpen(false); }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full" variant="outline">
                      <LogIn className="w-4 h-4 mr-2" /> Login
                    </Button>
                  </Link>
                )}
                <Link to="/events" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                    Join the Journey
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
