import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "../../../utils/cn";

export function TurBadge({ tur }: { tur: string }): React.ReactElement {
  const map: Record<string, { label: string; cls: string }> = {
    mal: {
      label: "Mal",
      cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    hizmet: {
      label: "Hizmet",
      cls:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    },
    yapim_isi: {
      label: "Yapım",
      cls:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    danismanlik: {
      label: "Danışmanlık",
      cls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    },
  };
  const { label, cls } = map[tur] ?? {
    label: tur,
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide",
        cls,
      )}
    >
      {label}
    </span>
  );
}

export function DurumBadge({
  durumAsamaId,
  isDeleted,
  status,
}: {
  durumAsamaId: number | null;
  isDeleted?: number;
  status?: string;
}): React.ReactElement {
  if (isDeleted === 1) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
        <XCircle size={9} /> İptal Edildi
      </span>
    );
  }
  if (status === "tamamlandi") {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400">
        <CheckCircle2 size={9} /> Tamamlandı
      </span>
    );
  }
  if (!durumAsamaId) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
        <Clock size={9} /> Taslak
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 size={9} /> Aktif
    </span>
  );
}
