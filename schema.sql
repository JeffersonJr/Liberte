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
  user_id UUID REFERENCES auth.users NOT NULL,
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
  user_id UUID REFERENCES auth.users NOT NULL,
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
  user_id UUID REFERENCES auth.users NOT NULL,
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
