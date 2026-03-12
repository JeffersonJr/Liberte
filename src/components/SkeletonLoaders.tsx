export function SkeletonPost() {
    return (
        <div className="w-full max-w-2xl mx-auto border-b border-zinc-900 py-6 px-4 md:px-0 animate-pulse">
            <div className="flex gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-full" />
                <div className="flex-grow">
                    <div className="flex gap-2 mb-4">
                        <div className="h-4 w-24 bg-zinc-900 rounded" />
                        <div className="h-4 w-16 bg-zinc-900 rounded" />
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="h-4 w-full bg-zinc-900 rounded" />
                        <div className="h-4 w-[90%] bg-zinc-900 rounded" />
                    </div>
                    <div className="aspect-[4/5] w-full bg-zinc-900 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonMoments() {
    return (
        <div className="w-full py-4 border-b border-zinc-900 flex gap-4 px-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full" />
                    <div className="h-2 w-12 bg-zinc-900 rounded" />
                </div>
            ))}
        </div>
    );
}
