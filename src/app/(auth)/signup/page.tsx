"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            setIsLoading(false);
            return;
        }

        // Defensive check for placeholder credentials
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
            setError("Configuração do Supabase ausente. Por favor, atualize o arquivo .env.local com sua URL real do Supabase (ex: xyzabc.supabase.co).");
            setIsLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        // Success - usually shows a check email message
        router.push("/login?message=Check your email to confirm your account");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black text-zinc-100">
            {/* Background Orbs */}
            <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-0 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-[128px] animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl space-y-8">
                    <div className="text-center space-y-4">
                        <Logo width={200} height={50} className="mx-auto" />
                        <p className="text-zinc-400">
                            Crie sua conta para começar
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="E-mail"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <Input
                                label="Senha"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <Input
                                label="Confirmar Senha"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg"
                            isLoading={isLoading}
                        >
                            Cadastrar
                        </Button>
                    </form>

                    <p className="text-center text-zinc-500 text-sm">
                        Já tem uma conta?{" "}
                        <Link
                            href="/login"
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            Entrar
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
