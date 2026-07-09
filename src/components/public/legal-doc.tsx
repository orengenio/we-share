import type { ReactNode } from "react";

/**
 * Shared frame for the native legal pages (/terms, /privacy,
 * /earnings-disclaimer). Long legal text reads on a light card against the
 * navy public layout; a PDF download stays available for records.
 */
export default function LegalDoc({
  title,
  subtitle,
  effective,
  pdfHref,
  children,
}: {
  title: string;
  subtitle: string;
  effective: string;
  pdfHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "#E66100" }}>
          WeShare by OrenGen · Legal
        </p>
        <h1 className="text-3xl font-black text-white tracking-tight" style={{ textWrap: "balance" }}>{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
        <p className="mt-1 text-xs text-slate-400">
          OrenGen Worldwide LLC · {effective}
          {pdfHref && (
            <>
              {" · "}
              <a href={pdfHref} className="font-semibold underline decoration-slate-500 hover:text-slate-200">
                Download PDF
              </a>
            </>
          )}
        </p>
      </div>

      <article className="legal-doc rounded-2xl bg-white px-6 py-8 sm:px-10 shadow-xl text-[15px] leading-relaxed text-slate-800 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2:first-child]:mt-0 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5 [&_strong]:text-slate-900 [&_a]:text-[#CC5500] [&_a]:font-semibold [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5 [&_h3]:mb-1">
        {children}
      </article>

      <p className="mt-6 text-center text-xs text-slate-400">
        OrenGen Worldwide LLC · Mansfield, TX ·{" "}
        <a href="mailto:partners@orengen.io" className="underline">partners@orengen.io</a> · © 2026 All rights reserved.
      </p>
    </div>
  );
}
