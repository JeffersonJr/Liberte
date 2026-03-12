import { supabase } from '../supabase'

export async function liberteCreateMoment(userId: string, media: string) {
    const { data, error } = await supabase
        .from('moments')
        .insert([
            {
                user_id: userId,
                media_url: media,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        ])
        .select()

    if (error) throw error
    return data[0]
}

export async function liberteGetMoments() {
    const now = new Date().toISOString()
    const { data, error } = await supabase
        .from('moments')
        .select(`
      *,
      profiles (username, avatar_url)
    `)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function liberteRecordMomentView(userId: string, momentId: string) {
    const { error } = await supabase
        .from('moment_views')
        .upsert([
            {
                user_id: userId,
                moment_id: momentId
            }
        ], { onConflict: 'user_id, moment_id' })

    if (error) throw error
}

export async function liberteGetMomentViews(momentId: string) {
    const { data, error, count } = await supabase
        .from('moment_views')
        .select('*', { count: 'exact' })
        .eq('moment_id', momentId)

    if (error) throw error
    return count || 0
}
