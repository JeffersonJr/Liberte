"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Shield, Smartphone, ArrowRight, Check, AlertCircle, Copy, Key } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SecurityPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [mfaFactors, setMfaFactors] = useState<any[]>([]);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                checkMfaStatus();
            }
        }
    }, [user, authLoading, router]);

    async function checkMfaStatus() {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;
            setMfaFactors(data.all || []);
        } catch (err: any) {
            console.error("Error checking MFA:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function startEnrollment() {
        setError(null);
        setIsEnrolling(true);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                issuer: 'Liberte',
                friendlyName: user?.email?.split('@')[0] || 'User'
            });

            if (error) throw error;

            setFactorId(data.id);
            setQrCode(data.totp.qr_code);
        } catch (err: any) {
            setError(err.message);
            setIsEnrolling(false);
        }
    }

    async function verifyAndEnable() {
        setError(null);
        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: factorId!
            });

            if (challengeError) throw challengeError;

            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId: factorId!,
                challengeId: challengeData.id,
                code: verifyCode
            });

            if (verifyError) throw verifyError;

            setSuccess("Two-factor authentication enabled successfully!");
            setTimeout(() => {
                setIsEnrolling(false);
                setQrCode(null);
                setFactorId(null);
                setVerifyCode("");
                checkMfaStatus();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function unenroll(id: string) {
        if (!confirm("Are you sure you want to disable 2FA?")) return;
        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
            if (error) throw error;
            setSuccess("2FA disabled successfully.");
            checkMfaStatus();
        } catch (err: any) {
            setError(err.message);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex justify-center">
            <Sidebar onCompose={() => { }} />

            <main className="flex-grow max-w-2xl border-x border-border min-h-screen">
                <header className="glass sticky top-0 z-50 px-4 py-4 flex items-center gap-4">
                    <Link href="/settings" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="font-serif text-2xl font-bold tracking-tighter">Security & Privacy</h1>
                </header>

                <div className="p-6 space-y-8">
                    {/* Password Section */}
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Account Access</h2>
                        <div className="glass rounded-3xl p-4 flex items-center justify-between border border-border">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-foreground/5 rounded-2xl text-muted-foreground">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Password</h3>
                                    <p className="text-sm text-muted-foreground">Change your account password</p>
                                </div>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-sm font-bold transition-colors"
                            >
                                Update
                            </Link>
                        </div>
                    </section>

                    {/* 2FA Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Two-Factor Authentication</h2>
                            {mfaFactors.length > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase">Enabled</span>
                            )}
                        </div>

                        <div className="glass rounded-3xl overflow-hidden divide-y divide-border border border-border">
                            {mfaFactors.length === 0 ? (
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                        <Smartphone size={32} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Secure your account</h3>
                                    <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                                        Add an extra layer of security to your account by requiring an authentication code when you sign in.
                                    </p>
                                    {!isEnrolling ? (
                                        <button
                                            onClick={startEnrollment}
                                            className="px-8 py-3 bg-foreground text-background font-bold rounded-2xl hover:bg-foreground/90 transition-colors"
                                        >
                                            Set up 2FA
                                        </button>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                            {qrCode && (
                                                <div className="bg-white p-4 rounded-3xl inline-block">
                                                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                                </div>
                                            )}
                                            <div className="max-w-xs mx-auto">
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Scan this QR code with your authenticator app (like Google Authenticator or Authy), then enter the 6-digit code below.
                                                </p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={verifyCode}
                                                        onChange={(e) => setVerifyCode(e.target.value)}
                                                        maxLength={6}
                                                        placeholder="000000"
                                                        className="flex-grow bg-foreground/5 border border-border rounded-xl px-4 py-3 text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-foreground"
                                                    />
                                                    <button
                                                        onClick={verifyAndEnable}
                                                        disabled={verifyCode.length !== 6}
                                                        className="p-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                                                    >
                                                        <ArrowRight size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                mfaFactors.map((factor) => (
                                    <div key={factor.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{factor.friendly_name || 'Authenticator App'}</h3>
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Standard TOTP</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => unenroll(factor.id)}
                                            className="px-4 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            Disable
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Indicators */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center gap-3 text-sm"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center gap-3 text-sm"
                            >
                                <Check size={18} />
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Privacy Info */}
                    <section className="p-6 bg-foreground/5 rounded-3xl border border-border">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                            <Shield size={18} className="text-muted-foreground" />
                            Privacy and Data
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your security is our priority. We use end-to-end encryption for private messages and industry-standard protocols for account protection. We never share your personal data with third parties.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
