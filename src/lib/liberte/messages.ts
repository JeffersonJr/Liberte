import { supabase } from '../supabase';

export interface LiberteConversation {
    id: string;
    created_at: string;
    last_message_at: string;
    participants: {
        user_id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    }[];
}

export interface LiberteMessage {
    id: string;
    created_at: string;
    conversation_id: string;
    sender_id: string;
    content: string;
}

/**
 * Fetch all conversations for a user
 */
export async function liberteGetConversations(userId: string): Promise<LiberteConversation[]> {
    const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
            conversation_id,
            conversations (
                id,
                created_at,
                last_message_at
            )
        `)
        .eq('user_id', userId);

    if (error) throw error;

    // Get all participants for these conversations
    const convIds = data.map(d => d.conversation_id);
    const { data: participants, error: pError } = await supabase
        .from('conversation_participants')
        .select(`
            conversation_id,
            user_id,
            profiles:user_id (username, full_name, avatar_url)
        `)
        .in('conversation_id', convIds);

    if (pError) throw pError;

    return data.map(d => {
        const conv = Array.isArray(d.conversations) ? d.conversations[0] : d.conversations;
        const c = conv as any;
        return {
            id: c.id,
            created_at: c.created_at,
            last_message_at: c.last_message_at,
            participants: participants
                .filter(p => p.conversation_id === c.id)
                .map(p => ({
                    user_id: p.user_id,
                    username: (p.profiles as any).username,
                    full_name: (p.profiles as any).full_name,
                    avatar_url: (p.profiles as any).avatar_url
                }))
        };
    }) as any[];
}

/**
 * Fetch messages from a conversation
 */
export async function liberteGetMessages(conversationId: string): Promise<LiberteMessage[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Send a message
 */
export async function liberteSendMessage(senderId: string, conversationId: string, content: string) {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: senderId,
            conversation_id: conversationId,
            content
        })
        .select()
        .single();

    if (error) throw error;

    // Update conversation timestamp
    await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    return data;
}

/**
 * Start a new conversation between two users
 */
export async function liberteCreateConversation(userId1: string, userId2: string) {
    // Check if conversation already exists (simplified check)
    // In a real app, you'd find a conversation where both share the same ID

    const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

    if (convError) throw convError;

    const { error: pError } = await supabase
        .from('conversation_participants')
        .insert([
            { conversation_id: conv.id, user_id: userId1 },
            { conversation_id: conv.id, user_id: userId2 }
        ]);

    if (pError) throw pError;

    return conv;
}
