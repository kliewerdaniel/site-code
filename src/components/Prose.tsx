import type { ReactNode } from "react";

// Article typography for rendered markdown — Tailwind classes only,
// scoped to direct children of the <article>.
export function Prose({ children }: { children: ReactNode }) {
  return (
    <article className="text-paper-dim leading-relaxed space-y-5 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-paper [&_h1]:tracking-tight [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-paper [&_h2]:tracking-tight [&_h2]:pt-4 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-paper [&_h3]:pt-2 [&_p]:leading-relaxed [&_strong]:text-paper [&_strong]:font-semibold [&_a]:text-moss [&_a]:underline [&_a]:decoration-moss/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-moss [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_li]:leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:border-moss [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-paper [&_code]:font-mono [&_code]:text-sm [&_code]:bg-ink-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-amber [&_pre]:bg-ink-card [&_pre]:border [&_pre]:border-hairline [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-paper-dim [&_table]:w-full [&_table]:border-collapse [&_table]:font-mono [&_table]:text-sm [&_th]:text-left [&_th]:border-b [&_th]:border-hairline [&_th]:px-3 [&_th]:py-2 [&_th]:text-paper [&_td]:border-b [&_td]:border-hairline/50 [&_td]:px-3 [&_td]:py-2 [&_hr]:border-hairline [&_img]:rounded-md [&_img]:ring-1 [&_img]:ring-hairline">
      {children}
    </article>
  );
}


export default Prose;
