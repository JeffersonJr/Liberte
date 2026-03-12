import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-[0.98]",
            secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:scale-[0.98]",
            outline: "border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 active:scale-[0.98]",
            ghost: "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 active:scale-[0.98]",
            danger: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20 active:scale-[0.98]",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-10 w-10 p-0",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Carregando...</span>
                    </div>
                ) : (
                    children
                )}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
