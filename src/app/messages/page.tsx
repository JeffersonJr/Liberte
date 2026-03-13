"use client";

import { useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, ArrowLeft, Search, MoreVertical } from "lucide-react";
import {
    liberteGetConversations,
    liberteGetMessages,
    liberteSendMessage
} from "@/lib/liberte/messages";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!user) return;
        async function loadConversations() {
            setIsLoading(true);
            try {
                const data = await liberteGetConversations(user!.id);
                setConversations(data || []);
            } catch (error) {
                console.error("Error loading conversations:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadConversations();
    }, [user]);

    useEffect(() => {
        if (selectedConv) {
            async function loadMessages() {
                try {
                    const data = await liberteGetMessages(selectedConv.id);
                    setMessages(data || []);
                    setTimeout(scrollToBottom, 100);
                } catch (error) {
                    console.error("Error loading messages:", error);
                }
            }
            loadMessages();
        }
    }, [selectedConv]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv || isSending || !user) return;

        setIsSending(true);
        try {
            const data = await liberteSendMessage(user.id, selectedConv.id, newMessage);
            setMessages([...messages, data]);
            setNewMessage("");
            setTimeout(scrollToBottom, 50);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const getOtherParticipant = (participants: any[]) => {
        return participants.find(p => p.user_id !== user?.id) || participants[0];
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center">
            <Sidebar onCompose={() => { }} />

            <main className="flex-grow max-w-2xl border-x border-zinc-900 min-h-screen flex">
                {/* Conversation List */}
                <div className={`w-full md:w-80 flex-shrink-0 border-r border-zinc-900 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                    <header className="glass sticky top-0 z-10 px-4 py-4 backdrop-blur-xl border-b border-zinc-900">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="font-serif text-2xl font-bold text-zinc-100">Messages</h1>
                            <Mail size={24} className="text-zinc-500" />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search Direct Messages"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                            />
                        </div>
                    </header>

                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-12 h-12 bg-zinc-900 rounded-full" />
                                        <div className="flex-grow space-y-2 py-1">
                                            <div className="h-4 bg-zinc-900 rounded w-1/2" />
                                            <div className="h-3 bg-zinc-900 rounded w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : conversations.length > 0 ? (
                            conversations.map((conv) => {
                                const other = getOtherParticipant(conv.participants);
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConv(conv)}
                                        className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-zinc-900/40 relative ${selectedConv?.id === conv.id ? 'bg-zinc-900/50 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-zinc-100' : ''}`}
                                    >
                                        <img
                                            src={other?.avatar_url || "/logo.png"}
                                            alt={other?.username}
                                            className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className="font-bold text-zinc-100 truncate">{other?.full_name}</p>
                                                <p className="text-zinc-600 text-xs">
                                                    {formatDistanceToNow(new Date(conv.last_message_at))}
                                                </p>
                                            </div>
                                            <p className="text-zinc-500 text-sm truncate">@{other?.username}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-zinc-500">No messages found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-grow flex flex-col min-h-screen ${!selectedConv ? 'hidden md:flex items-center justify-center bg-zinc-950/50' : 'flex'}`}>
                    {selectedConv ? (
                        <>
                            <header className="glass sticky top-0 z-10 px-4 py-3 flex items-center gap-4 backdrop-blur-xl border-b border-zinc-900">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden text-zinc-400">
                                    <ArrowLeft size={24} />
                                </button>
                                <img
                                    src={getOtherParticipant(selectedConv.participants)?.avatar_url || "/logo.png"}
                                    className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                                    alt="Avatar"
                                />
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-zinc-100 truncate">
                                        {getOtherParticipant(selectedConv.participants)?.full_name}
                                    </p>
                                    <p className="text-zinc-500 text-xs">
                                        @{getOtherParticipant(selectedConv.participants)?.username}
                                    </p>
                                </div>
                                <button className="text-zinc-500">
                                    <MoreVertical size={20} />
                                </button>
                            </header>

                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user?.id
                                                ? 'bg-zinc-100 text-black rounded-tr-none'
                                                : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                                {formatDistanceToNow(new Date(msg.created_at))} ago
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900 bg-zinc-950">
                                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-3xl px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Start a new message"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-grow bg-transparent text-zinc-100 text-sm focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="text-zinc-100 disabled:text-zinc-600 transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <h2 className="font-serif text-3xl font-bold text-zinc-100 mb-2">Select a message</h2>
                            <p className="text-zinc-500 max-w-xs mx-auto">Choose from your existing conversations or start a new one to begin chatting.</p>
                            <button className="mt-6 bg-zinc-100 text-black px-6 py-2 rounded-full font-bold hover:bg-white transition-colors">
                                New Message
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
