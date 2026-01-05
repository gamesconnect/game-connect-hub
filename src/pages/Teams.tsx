import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trophy, Users, Star, Target } from 'lucide-react';

const teams = [
  {
    name: 'Team Red',
    emoji: '🔥',
    tagline: 'Fire & Passion',
    description: 'Known for their fierce competitive spirit and unwavering determination. Team Red never backs down from a challenge.',
    members: 485,
    wins: 127,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    achievements: ['Most Improved Team 2024', 'Gaming Tournament Champions', 'Best Team Spirit Award']
  },
  {
    name: 'Team Yellow',
    emoji: '⚡',
    tagline: 'Lightning Speed',
    description: 'Quick thinking and faster reflexes. Team Yellow strikes with precision and speed that catches opponents off guard.',
    members: 423,
    wins: 134,
    color: 'from-yellow-400 to-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    achievements: ['Speed Challenge Winners', 'Trivia Night Champions', 'Innovation Award']
  },
  {
    name: 'Team Green',
    emoji: '🌿',
    tagline: "Nature's Force",
    description: 'Grounded, strategic, and always growing. Team Green brings a calm strength that overwhelms the competition.',
    members: 467,
    wins: 119,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    achievements: ['Outdoor Games Champions', 'Most Collaborative Team', 'Sustainability Award']
  },
  {
    name: 'Team Blue',
    emoji: '🌊',
    tagline: 'Ocean Deep',
    description: 'Deep thinkers with waves of creativity. Team Blue brings strategic depth and unstoppable momentum.',
    members: 512,
    wins: 142,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    achievements: ['Overall Champions 2024', 'Most Members', 'Strategy Masters']
  }
];

export default function Teams() {
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
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {teams.map((team) => (
              <div
                key={team.name}
                className={`rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${team.borderColor} ${team.bgColor}`}
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl">{team.emoji}</div>
                    <div>
                      <h3 className={`text-3xl font-black bg-gradient-to-r ${team.color} bg-clip-text text-transparent`}>
                        {team.name}
                      </h3>
                      <p className="text-lg text-muted-foreground">{team.tagline}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">{team.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-card rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-foreground">{team.members}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Members</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-foreground">{team.wins}</span>
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
                      {team.achievements.map((achievement) => (
                        <li key={achievement} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="w-3 h-3 text-primary" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className={`w-full bg-gradient-to-r ${team.color} hover:opacity-90 text-white rounded-full border-0`}>
                    Join {team.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
