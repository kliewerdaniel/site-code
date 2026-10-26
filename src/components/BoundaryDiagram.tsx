/* The execution boundary — drawn as a programmatic SVG rather than generated
   artwork, because the whole point of the diagram is that the labels are
   correct. A diffusion model cannot spell "allowlist" reliably, and a diagram
   that mislabels the architecture is worse than no diagram.

   Semantics: the model emits a PROPOSAL. It has no authority. The boundary
   validates it against an allowlist, path rules and schemas, and can refuse.
   Only then does the executor run anything, and everything — accepted or
   refused — is written to the record. */

export function BoundaryDiagram({ className = "" }: { className?: string }) {
  const ink = "currentColor";
  return (
    <svg
      viewBox="0 0 720 260"
      role="img"
      aria-labelledby="boundary-title boundary-desc"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="boundary-title">The execution boundary</title>
      <desc id="boundary-desc">
        A model emits a proposal. A deterministic boundary checks it against an
        allowlist, path restrictions and a schema, then either refuses it or
        passes it to an executor. Both outcomes are written to an audit record.
        The model never calls the executor directly.
      </desc>

      {/* model zone */}
      <rect x="0.5" y="70.5" width="150" height="96" stroke={ink} strokeOpacity="0.35" />
      <text x="16" y="96" className="label" fill={ink} fillOpacity="0.55" fontSize="10" letterSpacing="2">
        MODEL
      </text>
      <text x="16" y="122" fill={ink} fontSize="14">proposes</text>
      <text x="16" y="144" fill={ink} fillOpacity="0.6" fontSize="12">no authority</text>

      {/* proposal arrow */}
      <line x1="150" y1="118" x2="196" y2="118" stroke={ink} strokeOpacity="0.5" />
      <path d="M196 118 l-8 -4 v8 z" fill={ink} fillOpacity="0.6" />
      <text x="152" y="108" fill={ink} fillOpacity="0.55" fontSize="10" letterSpacing="1.5">
        INTENT
      </text>

      {/* boundary */}
      <rect
        x="200.5"
        y="46.5"
        width="180"
        height="144"
        stroke="var(--color-gold)"
        strokeOpacity="0.85"
        strokeDasharray="4 3"
      />
      <text x="216" y="72" fill="var(--color-gold)" fontSize="10" letterSpacing="2">
        BOUNDARY
      </text>
      <text x="216" y="100" fill={ink} fontSize="13">allowlist</text>
      <text x="216" y="124" fill={ink} fontSize="13">path rules</text>
      <text x="216" y="148" fill={ink} fontSize="13">schema</text>
      <text x="216" y="174" fill={ink} fillOpacity="0.55" fontSize="11">deterministic</text>

      {/* refuse branch */}
      <line x1="380" y1="88" x2="430" y2="52" stroke={ink} strokeOpacity="0.45" />
      <path d="M430 52 l-9 -1 l5 7 z" fill={ink} fillOpacity="0.5" />
      <text x="436" y="46" fill={ink} fillOpacity="0.7" fontSize="12">refused</text>
      <text x="436" y="62" fill={ink} fillOpacity="0.45" fontSize="10">logged, not silently dropped</text>

      {/* allow branch */}
      <line x1="380" y1="118" x2="430" y2="118" stroke="var(--color-gold)" strokeOpacity="0.9" />
      <path d="M430 118 l-8 -4 v8 z" fill="var(--color-gold)" />
      <text x="386" y="108" fill="var(--color-gold)" fontSize="10" letterSpacing="1.5">
        PERMITTED
      </text>

      {/* executor */}
      <rect x="434.5" y="70.5" width="130" height="96" stroke={ink} strokeOpacity="0.35" />
      <text x="450" y="96" fill={ink} fillOpacity="0.55" fontSize="10" letterSpacing="2">
        EXECUTOR
      </text>
      <text x="450" y="122" fill={ink} fontSize="14">runs</text>
      <text x="450" y="144" fill={ink} fillOpacity="0.6" fontSize="12">one operation</text>

      {/* record */}
      <line x1="564" y1="118" x2="600" y2="118" stroke={ink} strokeOpacity="0.5" />
      <path d="M600 118 l-8 -4 v8 z" fill={ink} fillOpacity="0.6" />
      <rect x="604.5" y="70.5" width="112" height="96" stroke={ink} strokeOpacity="0.35" />
      <text x="618" y="96" fill={ink} fillOpacity="0.55" fontSize="10" letterSpacing="2">
        RECORD
      </text>
      <text x="618" y="122" fill={ink} fontSize="13">audit trail</text>
      <text x="618" y="144" fill={ink} fillOpacity="0.6" fontSize="12">+ hashes</text>

      {/* the point */}
      <path
        d="M275 190 v34 h-275"
        stroke={ink}
        strokeOpacity="0.25"
        strokeDasharray="3 4"
      />
      <text x="0" y="240" fill={ink} fillOpacity="0.45" fontSize="11">
        The model never calls the executor directly.
      </text>
    </svg>
  );
}
