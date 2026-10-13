"use client";

import { EMAIL } from "@/config";

type Variant = "band" | "inline" | "gate";

const enabled = !EMAIL.buttondownEndpoint.startsWith("#");

export function EmailCapture({
  variant = "inline",
  heading = "Get the sample chapter",
  blurb = "First chapter of Computational Sovereignty, free. Plus launch updates — no spam, unsubscribe anytime.",
}: {
  variant?: Variant;
  heading?: string;
  blurb?: string;
}) {
  if (variant === "band") {
    return (
      <section className="border-y border-hairline bg-ink-soft">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-moss mb-4">
              Newsletter
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-paper">
              {heading}
            </h2>
            <p className="mt-3 text-paper-dim leading-relaxed">{blurb}</p>
          </div>
          <CaptureForm />
        </div>
      </section>
    );
  }

  if (variant === "gate") {
    return (
      <div className="border border-hairline rounded-md bg-ink-card p-8 max-w-md w-full">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-paper">
          {heading}
        </h2>
        <p className="mt-3 text-paper-dim leading-relaxed text-sm">{blurb}</p>
        <div className="mt-6">
          <CaptureForm />
        </div>
      </div>
    );
  }

  // "inline"
  return (
    <div className="max-w-md">
      <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-moss mb-2">
        {heading}
      </h3>
      {blurb && <p className="text-sm text-paper-dim mb-4">{blurb}</p>}
      <CaptureForm />
    </div>
  );
}

function CaptureForm() {
  if (!enabled) {
    return (
      <div className="flex flex-col gap-3 opacity-70" aria-disabled="true">
        <div className="flex gap-2">
          <input
            type="email"
            disabled
            placeholder="you@example.com"
            className="flex-1 rounded-md bg-ink border border-hairline px-4 py-3 font-mono text-sm text-paper-dim placeholder:text-paper-dim/50 cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            className="rounded-md bg-ink-card border border-hairline px-5 py-3 font-mono text-sm text-paper-dim cursor-not-allowed"
          >
            Subscribe
          </button>
        </div>
        <p className="font-mono text-xs text-paper-dim">
          Email capture opens at launch.
        </p>
      </div>
    );
  }

  return (
    <form
      action={EMAIL.buttondownEndpoint}
      method="post"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col sm:flex-row gap-2"
    >
      <label htmlFor="email-capture-email" className="sr-only">
        Email address
      </label>
      <input
        id="email-capture-email"
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="flex-1 rounded-md bg-ink border border-hairline px-4 py-3 font-mono text-sm text-paper placeholder:text-paper-dim/50 focus:outline-none focus:border-moss"
      />
      <button
        type="submit"
        className="rounded-md bg-moss text-ink px-5 py-3 font-mono text-sm font-semibold hover:bg-moss-deep transition-colors"
      >
        Subscribe
      </button>
    </form>
  );
}


export default EmailCapture;
