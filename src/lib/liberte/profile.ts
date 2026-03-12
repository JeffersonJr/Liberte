import { supabase } from '../supabase'

export async function liberteUpdateProfile(userId: string, updates: { username?: string, full_name?: string, avatar_url?: string, bio?: string }) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()

    if (error) throw error
    return data[0]
}

export async function liberteGetProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data
}
