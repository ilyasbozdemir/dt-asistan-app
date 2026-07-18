import type { ReactElement } from "react";
import {
    Building2,
    ChevronDown,
    FileCheck,
    Files,
    FileSignature,
    FileText,
    History,
    Shield,
    ShieldCheck,
    ShoppingCart,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@renderer/components/ui/DropdownMenu";

interface WinnerDocumentsMenuProps {
    onPrintResultApproval: () => void;
    onPrintAcceptanceLetter: () => void;
    onPrintOrderForm?: () => void;
    onPrintContract?: () => void;
    onEkapBlacklistQuery: () => void;
    onEdevletBlacklistQuery: () => void;
    onViewFirmaDetails?: () => void;
    onViewTeklifHistory?: () => void;
}

export function WinnerDocumentsMenu({
    onPrintResultApproval,
    onPrintAcceptanceLetter,
    onPrintOrderForm,
    onPrintContract,
    onEkapBlacklistQuery,
    onEdevletBlacklistQuery,
    onViewFirmaDetails,
    onViewTeklifHistory,
}: WinnerDocumentsMenuProps): ReactElement {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-700 dark:hover:bg-slate-600 shadow-sm hover:shadow-md cursor-pointer">
                    <Files className="h-4 w-4" />
                    Belge İşlemleri
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72">
                {/* ── 📑 Belgeler ── */}
                <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    📑 Belgeler
                </DropdownMenuLabel>

                <DropdownMenuItem onClick={onPrintResultApproval}>
                    <FileCheck className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>Sonuç Onay Belgesi</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onPrintAcceptanceLetter}>
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Kabul Yazısı</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={onPrintOrderForm}
                    disabled={!onPrintOrderForm}
                >
                    <ShoppingCart className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Sipariş Formu</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={onPrintContract}
                    disabled={!onPrintContract}
                >
                    <FileSignature className="mr-2 h-4 w-4 text-violet-500" />
                    <span>Sözleşme</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* ── 🔎 Sorgulamalar ── */}
                <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    🔎 Sorgulamalar
                </DropdownMenuLabel>

                <DropdownMenuItem onClick={onEkapBlacklistQuery}>
                    <ShieldCheck className="mr-2 h-4 w-4 text-orange-500" />
                    <span>EKAP Yasaklı Sorgula</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onEdevletBlacklistQuery}>
                    <Shield className="mr-2 h-4 w-4 text-indigo-500" />
                    <span>e-Devlet Yasaklı Sorgula</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* ── 👤 Firma ── */}
                <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    👤 Firma
                </DropdownMenuLabel>

                <DropdownMenuItem
                    onClick={onViewFirmaDetails}
                    disabled={!onViewFirmaDetails}
                >
                    <Building2 className="mr-2 h-4 w-4 text-cyan-500" />
                    <span>Firma Bilgileri</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={onViewTeklifHistory}
                    disabled={!onViewTeklifHistory}
                >
                    <History className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Teklif Geçmişi</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
