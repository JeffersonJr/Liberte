import { supabase } from '../supabase';
import { liberteCreateNotification } from './notifications';

export interface LiberteProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    website?: string;
    bio?: string; // If added to schema
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
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase
        .from('follows')
        .select(`
            follower_id,
            profiles:follower_id (*)
        `)
        .eq('following_id', userId);

    if (error) throw error;
    return data.map((d: any) => d.profiles);
}

/**
 * Get following list
 */
export async function liberteGetFollowing(userId: string) {
    const { data, error } = await supabase
        .from('follows')
        .select(`
            following_id,
            profiles:following_id (*)
        `)
        .eq('follower_id', userId);

    if (error) throw error;
    return data.map((d: any) => d.profiles);
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
