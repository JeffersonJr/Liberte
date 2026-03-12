import { supabase } from '../supabase';

export interface LiberteNotification {
    id: string;
    created_at: string;
    user_id: string;
    actor_id: string;
    type: 'like' | 'comment' | 'repost' | 'follow';
    post_id?: string;
    is_read: boolean;
    actor?: {
        username: string;
        full_name: string;
        avatar_url: string;
    };
    post?: {
        content: string;
    };
}

/**
 * Fetch notifications for a specific user
 */
export async function liberteGetNotifications(userId: string): Promise<LiberteNotification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:actor_id (username, full_name, avatar_url),
            post:post_id (content)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
}

/**
 * Mark a notification as read
 */
export async function liberteMarkNotificationAsRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) throw error;
    return true;
}

/**
 * Internal helper to create a notification
 */
export async function liberteCreateNotification(
    userId: string,
    actorId: string,
    type: 'like' | 'comment' | 'repost' | 'follow',
    postId?: string
) {
    // Avoid notifying yourself
    if (userId === actorId) return null;

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            actor_id: actorId,
            type,
            post_id: postId
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
