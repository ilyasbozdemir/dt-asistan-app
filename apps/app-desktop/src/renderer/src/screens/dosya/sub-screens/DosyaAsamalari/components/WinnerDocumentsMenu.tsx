import type { ReactElement } from "react";

import { ChevronDown, FileCheck, Files, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@renderer/components/ui/DropdownMenu";

interface WinnerDocumentsMenuProps {
    onPrintResultApproval: () => void;
    onPrintAcceptanceLetter: () => void;
}

export function WinnerDocumentsMenu({
    onPrintResultApproval,
    onPrintAcceptanceLetter,
}: WinnerDocumentsMenuProps): ReactElement {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                    <Files className="h-4 w-4" />
                    Belge İşlemleri
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={onPrintResultApproval}>
                    <FileCheck className="mr-2 h-4 w-4 text-emerald-600" />
                    Sonuç Onay Belgesini Yazdır
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onPrintAcceptanceLetter}>
                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                    Kabul Yazısını Yazdır
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
