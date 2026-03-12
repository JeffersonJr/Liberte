-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT,
  media TEXT[] DEFAULT '{}',
  aspect_ratio TEXT DEFAULT '4/5',
  parent_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- For replies/comments
  repost_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- For reposts
  likes_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  CONSTRAINT content_length CHECK (char_length(content) <= 250)
);

-- Set up RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone." ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts." ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts." ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts." ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create moments table
CREATE TABLE moments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '24 hours') NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  media_url TEXT NOT NULL
);

-- Set up RLS for moments
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moments are viewable by everyone while active." ON moments
  FOR SELECT USING (expires_at > now());

CREATE POLICY "Users can insert their own moments." ON moments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moments." ON moments
  FOR DELETE USING (auth.uid() = user_id);

-- Create moment_views table
CREATE TABLE moment_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(moment_id, user_id)
);

-- Set up RLS for moment_views
ALTER TABLE moment_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewers can see counts but authors can see list." ON moment_views
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM moments WHERE id = moment_id)
  );

CREATE POLICY "Users can record their own views." ON moment_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create follows table
CREATE TABLE follows (
  follower_id UUID REFERENCES public.profiles(id) NOT NULL,
  following_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone." ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others." ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone." ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts." ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications." ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see participants in their conversations." ON conversation_participants
  FOR SELECT USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see messages in their conversations." ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_participants WHERE conversation_id = messages.conversation_id
    )
  );

CREATE POLICY "Users can send messages to their conversations." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT user_id FROM conversation_participants WHERE conversation_id = messages.conversation_id
    )
  );
