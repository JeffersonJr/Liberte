import { supabase } from '../supabase';

const MOCK_POSTS = [
    {
        content: "Explorando as novas funcionalidades do Liberte! A interface está ficando incrível. 🚀 #Liberte #Web3 #Social",
        likes_count: 12,
        replies_count: 3,
        reposts_count: 2
    },
    {
        content: "A liberdade de expressão é a base de uma sociedade saudável. No Liberte, nós construímos isso juntos. 🕊️",
        likes_count: 45,
        replies_count: 8,
        reposts_count: 15
    },
    {
        content: "O modo escuro ficou simplesmente fantástico! Parabéns aos desenvolvedores. 🌙✨",
        likes_count: 28,
        replies_count: 5,
        reposts_count: 1
    },
    {
        content: "Bom dia, mundo! Que hoje seja um dia de grandes conquistas para todos nós. ☀️",
        likes_count: 15,
        replies_count: 2,
        reposts_count: 0
    },
    {
        content: "Você já conferiu os novos Momentos? Estão sensacionais! 📸",
        likes_count: 33,
        replies_count: 12,
        reposts_count: 4
    }
];

export async function seedMockData(userId: string) {
    console.log("Seeding mock data for user:", userId);

    try {
        // 1. Create posts
        const postsToInsert = MOCK_POSTS.map(post => ({
            ...post,
            user_id: userId,
            created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // Random date in last 7 days
        }));

        const { data: posts, error: postError } = await supabase
            .from('posts')
            .insert(postsToInsert)
            .select();

        if (postError) throw postError;
        console.log(`Inserted ${posts?.length} posts.`);

        // 2. Create comments for the first post
        if (posts && posts.length > 0) {
            const firstPostId = posts[0].id;
            const commentsToInsert = [
                {
                    content: "Concordo plenamente! O design está muito limpo.",
                    user_id: userId,
                    parent_id: firstPostId,
                    created_at: new Date().toISOString()
                },
                {
                    content: "Mal posso esperar pelas próximas atualizações.",
                    user_id: userId,
                    parent_id: firstPostId,
                    created_at: new Date(Date.now() + 1000).toISOString()
                }
            ];

            const { error: commentError } = await supabase
                .from('posts')
                .insert(commentsToInsert);

            if (commentError) throw commentError;
            console.log("Inserted comments.");
        }

        // 3. Create moments
        const momentsToInsert = [
            {
                user_id: userId,
                media_url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop",
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 86400000).toISOString()
            }
        ];

        const { error: momentError } = await supabase
            .from('moments')
            .insert(momentsToInsert);

        if (momentError) throw momentError;
        console.log("Inserted moments.");

        return { success: true };
    } catch (error) {
        console.error("Error seeding mock data:", error);
        return { success: false, error };
    }
}
