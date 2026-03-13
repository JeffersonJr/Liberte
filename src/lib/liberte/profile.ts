import { supabase } from '../supabase';
import { liberteCreateNotification } from './notifications';

export interface LiberteProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    website?: string;
    bio?: string;
    preferences?: any;
    followers_count?: number;
    following_count?: number;
}

/**
 * Fetch a user profile by ID
 */
export async function liberteGetProfile(userId: string): Promise<LiberteProfile> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;

    // Get counts
    const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

    const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

    return {
        ...data,
        followers_count: followers || 0,
        following_count: following || 0
    };
}

/**
 * Fetch a user profile by username
 */
export async function liberteGetProfileByUsername(username: string): Promise<LiberteProfile> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (error) throw error;
    return liberteGetProfile(data.id);
}

/**
 * Update a user profile
 */
export async function liberteUpdateProfile(userId: string, updates: Partial<LiberteProfile>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Fetch all posts by a specific user
 */
export async function liberteGetUserPosts(userId: string) {
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) return []

    const userIds = [...new Set(posts.map((p: any) => p.user_id))].filter(Boolean)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, id')
        .in('id', userIds)

    const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]))
    return posts.map((post: any) => ({
        ...post,
        profiles: profileMap[post.user_id] || null
    }))
}

/**
 * Follow a user
 */
export async function liberteFollowUser(followerId: string, followingId: string) {
    const { data, error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })
        .select()
        .single();

    if (error) throw error;

    // Trigger notification
    await liberteCreateNotification(followingId, followerId, 'follow');

    return data;
}

/**
 * Unfollow a user
 */
export async function liberteUnfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

    if (error) throw error;
    return true;
}

/**
 * Get followers list
 */
export async function liberteGetFollowers(userId: string) {
    const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

    if (followsError) throw followsError;
    if (!follows || follows.length === 0) return []

    const followerIds = follows.map((f: any) => f.follower_id)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followerIds)

    if (profilesError) throw profilesError
    return profiles || []
}

/**
 * Get following list
 */
export async function liberteGetFollowing(userId: string) {
    const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    if (followsError) throw followsError;
    if (!follows || follows.length === 0) return []

    const followingIds = follows.map((f: any) => f.following_id)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followingIds)

    if (profilesError) throw profilesError
    return profiles || []
}

/**
 * Check if the follower is following the target user
 */
export async function liberteIsFollowing(followerId: string, followingId: string) {
    const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();

    if (error) throw error;
    return !!data;
}
