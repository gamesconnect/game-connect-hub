-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT,
  author TEXT NOT NULL DEFAULT 'Games & Connect Team',
  category TEXT NOT NULL,
  image_url TEXT,
  read_time TEXT NOT NULL DEFAULT '5 min read',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog posts are viewable by everyone
CREATE POLICY "Blog posts are viewable by everyone"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Admins can manage blog posts
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can create contact messages
CREATE POLICY "Anyone can create contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Admins can view contact messages
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update contact messages
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Admins can view subscribers
CREATE POLICY "Admins can view subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  color_from TEXT NOT NULL,
  color_to TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  border_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams are viewable by everyone
CREATE POLICY "Teams are viewable by everyone"
ON public.teams
FOR SELECT
USING (true);

-- Admins can manage teams
CREATE POLICY "Admins can manage teams"
ON public.teams
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create team_stats table for tracking wins and members
CREATE TABLE public.team_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  wins INTEGER NOT NULL DEFAULT 0,
  members_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_id)
);

-- Enable RLS on team_stats
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;

-- Team stats are viewable by everyone
CREATE POLICY "Team stats are viewable by everyone"
ON public.team_stats
FOR SELECT
USING (true);

-- Admins can manage team stats
CREATE POLICY "Admins can manage team stats"
ON public.team_stats
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create team_achievements table
CREATE TABLE public.team_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  achievement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on team_achievements
ALTER TABLE public.team_achievements ENABLE ROW LEVEL SECURITY;

-- Team achievements are viewable by everyone
CREATE POLICY "Team achievements are viewable by everyone"
ON public.team_achievements
FOR SELECT
USING (true);

-- Admins can manage team achievements
CREATE POLICY "Admins can manage team achievements"
ON public.team_achievements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create team_memberships table for users joining teams
CREATE TABLE public.team_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS on team_memberships
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;

-- Users can view all team memberships
CREATE POLICY "Team memberships are viewable by everyone"
ON public.team_memberships
FOR SELECT
USING (true);

-- Authenticated users can join a team
CREATE POLICY "Authenticated users can join a team"
ON public.team_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can leave their own team
CREATE POLICY "Users can leave their own team"
ON public.team_memberships
FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_stats_updated_at
BEFORE UPDATE ON public.team_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default teams
INSERT INTO public.teams (name, emoji, tagline, description, color_from, color_to, bg_color, border_color) VALUES
('Team Red', '🔥', 'Fire & Passion', 'Known for their fierce competitive spirit and unwavering determination. Team Red never backs down from a challenge.', 'red-500', 'red-600', 'bg-red-500/10', 'border-red-500/30'),
('Team Yellow', '⚡', 'Lightning Speed', 'Quick thinking and faster reflexes. Team Yellow strikes with precision and speed that catches opponents off guard.', 'yellow-400', 'yellow-500', 'bg-yellow-500/10', 'border-yellow-500/30'),
('Team Green', '🌿', 'Nature''s Force', 'Grounded, strategic, and always growing. Team Green brings a calm strength that overwhelms the competition.', 'green-500', 'green-600', 'bg-green-500/10', 'border-green-500/30'),
('Team Blue', '🌊', 'Ocean Deep', 'Deep thinkers with waves of creativity. Team Blue brings strategic depth and unstoppable momentum.', 'blue-500', 'blue-600', 'bg-blue-500/10', 'border-blue-500/30');

-- Insert team stats
INSERT INTO public.team_stats (team_id, wins, members_count)
SELECT id, 
  CASE name 
    WHEN 'Team Red' THEN 127
    WHEN 'Team Yellow' THEN 134
    WHEN 'Team Green' THEN 119
    WHEN 'Team Blue' THEN 142
  END,
  CASE name 
    WHEN 'Team Red' THEN 485
    WHEN 'Team Yellow' THEN 423
    WHEN 'Team Green' THEN 467
    WHEN 'Team Blue' THEN 512
  END
FROM public.teams;

-- Insert team achievements
INSERT INTO public.team_achievements (team_id, achievement)
SELECT t.id, a.achievement FROM public.teams t
CROSS JOIN (VALUES 
  ('Team Red', 'Most Improved Team 2024'),
  ('Team Red', 'Gaming Tournament Champions'),
  ('Team Red', 'Best Team Spirit Award'),
  ('Team Yellow', 'Speed Challenge Winners'),
  ('Team Yellow', 'Trivia Night Champions'),
  ('Team Yellow', 'Innovation Award'),
  ('Team Green', 'Outdoor Games Champions'),
  ('Team Green', 'Most Collaborative Team'),
  ('Team Green', 'Sustainability Award'),
  ('Team Blue', 'Overall Champions 2024'),
  ('Team Blue', 'Most Members'),
  ('Team Blue', 'Strategy Masters')
) AS a(team_name, achievement)
WHERE t.name = a.team_name;

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, excerpt, author, category, image_url, read_time, created_at) VALUES
('Top 10 Games to Play at Your Next Game Night', 'From classic board games to modern party favorites, here are the best games to bring people together and create unforgettable memories.', 'Games & Connect Team', 'Gaming', 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg', '5 min read', '2025-01-15'),
('Exploring Ghana: Hidden Gems You Must Visit', 'Discover the lesser-known destinations across Ghana that offer incredible experiences for adventure seekers and culture enthusiasts.', 'Games & Connect Team', 'Travel', 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg', '8 min read', '2025-01-10'),
('Building Meaningful Connections in the Digital Age', 'How in-person events and shared experiences create deeper friendships than social media ever could.', 'Games & Connect Team', 'Community', 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg', '6 min read', '2025-01-05'),
('Cape Coast Adventure Recap: A Day to Remember', 'Relive the highlights from our recent Cape Coast adventure, featuring the Kakum canopy walkway and beach activities.', 'Games & Connect Team', 'Events', 'https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg', '4 min read', '2024-12-28');