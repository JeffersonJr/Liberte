"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const supabase = createClient();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setMessage("Enviamos um link de recuperação para o seu e-mail.");
        setIsLoading(false);
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
                        <h2 className="text-2xl font-bold font-serif">Recuperar Senha</h2>
                        <p className="text-zinc-400">
                            Insira seu e-mail para receber um link de redefinição
                        </p>
                    </div>

                    <form onSubmit={handleResetRequest} className="space-y-6">
                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />

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
                            {message ? "E-mail Enviado" : "Enviar Link"}
                        </Button>
                    </form>

                    <p className="text-center text-zinc-500 text-sm">
                        Lembrou a senha?{" "}
                        <Link
                            href="/login"
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            Voltar para o Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
