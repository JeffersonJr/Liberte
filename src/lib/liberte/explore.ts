import { supabase } from '../supabase';

/**
 * Search for posts based on a query string
 */
export async function liberteSearchPosts(query: string) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id (username, full_name, avatar_url)
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return data;
}

/**
 * Search for users based on username or full name
 */
export async function liberteSearchUsers(query: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

    if (error) throw error;
    return data;
}

/**
 * Get trending posts (most liked in the last 7 days)
 */
export async function liberteGetTrendingPosts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id (username, full_name, avatar_url)
        `)
        .gt('created_at', sevenDaysAgo.toISOString())
        .order('likes_count', { ascending: false })
        .limit(10);

    if (error) throw error;
    return data;
}

/**
 * Get discovery feed (random or high engagement posts)
 */
export async function liberteGetDiscoveryFeed() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(30);

    if (error) throw error;

    // In a real app, you'd shuffle or use a more complex recommendation engine
    return data;
}
