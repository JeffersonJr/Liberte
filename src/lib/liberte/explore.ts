import { supabase } from '../supabase';

/**
 * Search for posts based on a query string
 */
export async function liberteSearchPosts(query: string) {
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .textSearch('content', query)
        .order('created_at', { ascending: false })

    if (postsError) throw postsError
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

    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .gt('created_at', sevenDaysAgo.toISOString())
        .order('likes_count', { ascending: false })
        .limit(10)

    if (postsError) throw postsError
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
 * Get discovery feed (random or high engagement posts)
 */
export async function liberteGetDiscoveryFeed() {
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    if (postsError) throw postsError
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
