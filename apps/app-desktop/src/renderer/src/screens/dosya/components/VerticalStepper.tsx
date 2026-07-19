import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileSignature,
  FolderOpen,
  Package,
  Search,
} from "lucide-react";
import { cn } from "../../../utils/cn";

const STEPS = [
  {
    id: 1,
    label: "İhtiyaç Listesi & Maliyet & Onay",
    route: "/dosya/hazirlik-ve-ihtiyac",
    icon: Package,
  },
  {
    id: 2,
    label: "Teklifler & Piyasa Fiyat Araştırması",
    route: "/dosya/piyasa-fiyat-arastirmasi",
    icon: Search,
  },
  {
    id: 3,
    label: "Sipariş & Sözleşme",
    route: "/dosya/siparis-ve-sozlesme",
    icon: FileSignature,
  },
  {
    id: 4,
    label: "Muayene & Kabul & Ödeme",
    route: "/dosya/kabul-ve-odeme",
    icon: CheckCircle2,
  },
  {
    id: 5,
    label: "Klasör & Kapaklar",
    route: "/dosya/klasor-ve-kapaklar",
    icon: FolderOpen,
  },
];

export function VerticalStepper(): React.JSX.Element {
  const location = useLocation();
  const currentPath = location.pathname;

  const activeIndex = STEPS.findIndex((s) =>
    currentPath.includes(s.route.replace("/dosya/", ""))
  );

  return (
    <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 pr-6 py-4 flex flex-col relative before:absolute before:inset-y-0 before:left-[1.375rem] before:w-px before:bg-slate-200 dark:before:bg-slate-800 before:-z-10">
      <div className="space-y-6">
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          const Icon = step.icon;

          return (
            <Link
              key={step.id}
              to={step.route as any}
              className={cn(
                "group flex items-start gap-4 relative outline-none",
                isActive
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all shadow-sm z-10",
                  isActive
                    ? "bg-slate-900 dark:bg-slate-100 border-blue-500 text-white dark:text-slate-900 shadow-blue-500/20"
                    : isCompleted
                    ? "bg-blue-500 border-blue-500 text-white shadow-blue-500/20"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-700",
                )}
              >
                {isCompleted && !isActive
                  ? <CheckCircle2 className="w-5 h-5" />
                  : <span className="font-bold text-base">{step.id}</span>}
              </div>
              <div className="pt-2.5">
                <h3
                  className={cn(
                    "text-sm font-bold leading-none transition-colors",
                    isActive ? "text-blue-600 dark:text-blue-400" : "",
                  )}
                >
                  {step.label}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
