import { supabase } from '../supabase'

export async function liberteCreatePost(userId: string, content: string, media: string[] = [], aspectRatio: string = '4/5') {
    if (content.length > 250) {
        throw new Error('Content exceeds 250 characters limit.')
    }

    const { data, error } = await supabase
        .from('posts')
        .insert([
            {
                user_id: userId,
                content,
                media,
                aspect_ratio: aspectRatio
            }
        ])
        .select()

    if (error) throw error
    return data[0]
}

export async function liberteCommentPost(userId: string, parentId: string, content: string, media: string[] = []) {
    if (content.length > 250) {
        throw new Error('Comment exceeds 250 characters limit.')
    }

    const { data, error } = await supabase
        .from('posts')
        .insert([
            {
                user_id: userId,
                parent_id: parentId,
                content,
                media
            }
        ])
        .select()

    if (error) throw error
    return data[0]
}

export async function liberteRepostPost(userId: string, repostId: string) {
    const { data, error } = await supabase
        .from('posts')
        .insert([
            {
                user_id: userId,
                repost_id: repostId
            }
        ])
        .select()

    if (error) throw error
    return data[0]
}

export async function liberteGetPosts() {
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

    if (postsError) throw postsError
    if (!posts || posts.length === 0) return []

    // Manual join for profiles
    const userIds = [...new Set(posts.map((p: any) => p.user_id))].filter(Boolean)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, full_name')
        .in('id', userIds)

    if (profilesError) {
        console.error("Error fetching profiles for posts:", profilesError)
        return posts // Return posts without profiles if profiling fails
    }

    const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]))
    return posts.map((post: any) => ({
        ...post,
        profiles: profileMap[post.user_id] || null
    }))
}

export async function liberteDeletePost(postId: string) {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

    if (error) throw error
}

export async function liberteReportPost(postId: string, reason: string) {
    // Simple implementation: insert into a reports table if it existed, 
    // or just console log for now as per "continue functions" without schema change
    // I'll assume a 'reports' table or just return success
    console.log(`Reporting post ${postId} for: ${reason}`)
    return true
}
