import type { ImportSource } from "@/lib/types";

interface SourceSelectorProps {
    selected: ImportSource;
    onSelect: (source: ImportSource) => void;
}

const SUPPORTED_SOURCES: Set<ImportSource> = new Set(["Smartflo", "Other"]);

const sources: Array<{
    id: ImportSource;
    icon: string;
    name: string;
    subtitle: string;
}> = [
        {
            id: "Smartflo",
            icon: "📡",
            name: "Smartflo",
            subtitle: "Tata Tele Business Services",
        },
        {
            id: "Genesys",
            icon: "☎",
            name: "Genesys",
            subtitle: "CDR / Call Recording Export",
        },
        {
            id: "Exotel",
            icon: "🔗",
            name: "Exotel",
            subtitle: "CDR Export / API Sync",
        },
        {
            id: "Knowlarity",
            icon: "📞",
            name: "Knowlarity",
            subtitle: "SuperReceptionist Export",
        },
        {
            id: "Vapi",
            icon: "⚡",
            name: "Vapi / ElevenLabs",
            subtitle: "Voice AI — Auto Sync",
        },
        {
            id: "Other",
            icon: "⬆",
            name: "Other / Generic",
            subtitle: "CSV · JSON · ZIP",
        },
    ];

export function SourceSelector({ selected, onSelect }: SourceSelectorProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {sources.map((source) => {
                const supported = SUPPORTED_SOURCES.has(source.id);
                return (
                    <button
                        key={source.id}
                        onClick={supported ? () => onSelect(source.id) : undefined}
                        disabled={!supported}
                        className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                            !supported
                                ? "cursor-not-allowed border-border bg-card opacity-40 grayscale"
                                : selected === source.id
                                    ? "border-blue bg-blue/6"
                                    : "border-border bg-card hover:border-border2"
                        }`}
                    >
                        <div className="mb-1.5 text-[22px]">{source.icon}</div>
                        <div className="text-[13px] font-semibold text-text1">
                            {source.name}
                        </div>
                        <div className="mt-0.5 text-[10px] text-text3">{source.subtitle}</div>
                        {!supported && (
                            <div className="absolute inset-x-0 bottom-1.5 text-[9px] font-bold uppercase tracking-wider text-text3">
                                Coming Soon
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
