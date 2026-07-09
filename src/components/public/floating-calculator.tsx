"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Calculator, X } from "lucide-react";
import EarningsCalculator from "@/components/public/earnings-calculator";

/**
 * Persistent earnings-calculator launcher — the calculator is the strongest
 * conversion asset, so it rides on every public page as a slide-over. Hidden
 * on /calculator itself (the full page already is the calculator).
 */
export default function FloatingCalculator() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change; lock body scroll while open.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (pathname === "/calculator") return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open earnings calculator"
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03] motion-reduce:transition-none"
        style={{ backgroundColor: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.45)" }}
      >
        <Calculator size={17} />
        <span className="hidden sm:inline">Earnings Calculator</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex justify-end bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Earnings calculator"
            className="h-full w-full max-w-2xl overflow-y-auto px-5 py-6 sm:px-8"
            style={{ background: "linear-gradient(165deg, #001F3F 0%, #00254B 45%, #002952 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close calculator"
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <EarningsCalculator />
            <div className="h-8" />
          </div>
        </div>
      )}
    </>
  );
}
