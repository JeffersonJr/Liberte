"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setIsLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setMessage("Senha redefinida com sucesso! Redirecionando...");
        setIsLoading(false);

        setTimeout(() => {
            router.push("/login");
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black text-zinc-100">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-[128px] animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl space-y-8">
                    <div className="text-center space-y-4">
                        <Logo width={200} height={50} className="mx-auto" />
                        <h2 className="text-2xl font-bold font-serif">Nova Senha</h2>
                        <p className="text-zinc-400">
                            Crie uma nova senha para sua conta
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Nova Senha"
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

                        {message && (
                            <motion.p
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20 text-center"
                            >
                                {message}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg"
                            isLoading={isLoading}
                            disabled={!!message}
                        >
                            {message ? "Sucesso" : "Redefinir Senha"}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
