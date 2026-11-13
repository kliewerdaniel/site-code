"use client";

// GraphExplorer — the interactive knowledge graph.
//
// Static-first: the entity list is server-rendered as real links, so with
// JavaScript disabled it is still a complete navigation interface. On mount the
// component fetches the claim and evidence bundles (the large representations)
// and enhances the list into a graph with a detail panel. The rendered node set
// is bounded; the layout is deterministic.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  computeLayout,
  filterEdges,
  filterNodes,
  NODE_TYPE_ORDER,
  type ExplorerData,
  type ExplorerEdge,
  type ExplorerNodeType,
} from "@/lib/explorer-core";

interface Claim {
  id: string;
  statement: string;
  source: string;
  sourceSpan: string;
  category: string;
  assessment: string;
  verification: string;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  relationships: string[];
  authoritative: boolean;
  provenance: { source: string; generator: string; fingerprint: string };
}

interface Evidence {
  id: string;
  type: string;
  source: string;
  span?: string;
  verification: { status: string; method: string; verifiedBy?: string };
}

const TYPE_COLORS: Record<ExplorerNodeType, string> = {
  concept: "#c9a227",
  project: "#6f9fb8",
  article: "#8a8f98",
  path: "#a07fb5",
  chapter: "#5f8f6f",
  external: "#5a5f68",
};

const TYPE_RADII: Record<ExplorerNodeType, number> = {
  concept: 9,
  project: 8,
  article: 5,
  path: 6,
  chapter: 6,
  external: 4,
};

const MAX_LISTED = 400;

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function GraphExplorer({
  data,
  initialSelected,
}: {
  data: ExplorerData;
  initialSelected: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [relFilter, setRelFilter] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [maxDepth, setMaxDepth] = useState(1);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [bundlesLoaded, setBundlesLoaded] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    (async () => {
      try {
        const [c, e] = await Promise.all([
          fetch("/agents/claims.json").then((r) => r.json()),
          fetch("/agents/evidence.json").then((r) => r.json()),
        ]);
        if (cancelled) return;
        setClaims(c.claims ?? []);
        setEvidence(e.evidence ?? []);
        setBundlesLoaded(true);
      } catch {
        if (!cancelled) setBundlesLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNodes = useMemo(
    () => filterNodes(data.nodes, query, typeFilter),
    [data.nodes, query, typeFilter]
  );
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );
  const visibleEdges = useMemo(
    () => filterEdges(data.edges, relFilter, visibleNodeIds),
    [data.edges, relFilter, visibleNodeIds]
  );

  const layout = useMemo(() => {
    if (!selected) return null;
    const nodes = visibleNodeIds.has(selected) ? visibleNodes : data.nodes;
    return computeLayout(selected, nodes, visibleEdges, maxDepth);
  }, [selected, visibleNodes, visibleNodeIds, visibleEdges, data.nodes, maxDepth]);

  const evidenceById = useMemo(
    () => new Map(evidence.map((e) => [e.id, e])),
    [evidence]
  );

  const selectedNode = selected
    ? data.nodes.find((n) => n.id === selected) ?? null
    : null;

  const selectedEdges = useMemo(() => {
    if (!selected) return [];
    return data.edges.filter((e) => e.from === selected || e.to === selected);
  }, [selected, data.edges]);

  const selectedClaims = useMemo(() => {
    if (!selected) return [];
    const edgeIds = new Set(selectedEdges.map((e) => e.id));
    return claims.filter(
      (c) => c.relationships.some((r) => edgeIds.has(r)) || c.source.includes(selected)
    );
  }, [selected, selectedEdges, claims]);

  const otherNode = (e: ExplorerEdge): string =>
    e.from === selected ? e.to : e.from;

  const labelFor = (id: string): string =>
    data.nodes.find((n) => n.id === id)?.label ?? id;

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-node]") ?? []
    );
    const idx = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (idx === -1) return;
    e.preventDefault();
    const next =
      e.key === "ArrowDown"
        ? Math.min(items.length - 1, idx + 1)
        : Math.max(0, idx - 1);
    items[next]?.focus();
  };

  const grouped = useMemo(() => {
    const map = new Map<ExplorerNodeType, typeof visibleNodes>();
    for (const node of visibleNodes) {
      const list = map.get(node.type) ?? [];
      list.push(node);
      map.set(node.type, list);
    }
    return NODE_TYPE_ORDER.filter((t) => map.has(t)).map((t) => ({
      type: t,
      nodes: map.get(t)!,
    }));
  }, [visibleNodes]);

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)_22rem]">
      {/* ── Controls + entity list (the no-JS fallback navigation) ─────────── */}
      <div className="space-y-5">
        <div>
          <label htmlFor="graph-search" className="label block text-gold">
            Search entities
          </label>
          <input
            id="graph-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="concept, project, article…"
            className="mt-2 w-full border border-rule bg-void-2 px-3 py-2 text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none"
          />
        </div>

        <fieldset>
          <legend className="label text-gold">Entity types</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.nodeTypes.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={typeFilter.has(t)}
                onClick={() => setTypeFilter((s) => toggle(s, t))}
                className={`label border px-3 py-1 transition-colors ${
                  typeFilter.has(t)
                    ? "border-gold text-gold"
                    : "border-rule text-ink-3 hover:text-ink-2"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label text-gold">Relation types</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.relationTypes.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={relFilter.has(t)}
                onClick={() => setRelFilter((s) => toggle(s, t))}
                className={`label border px-3 py-1 transition-colors ${
                  relFilter.has(t)
                    ? "border-gold text-gold"
                    : "border-rule text-ink-3 hover:text-ink-2"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="label text-ink-3">
          {visibleNodes.length} of {data.nodes.length} entities · {visibleEdges.length}{" "}
          of {data.edges.length} edges
        </p>

        <nav aria-label="Entities">
          <ul
            ref={listRef}
            onKeyDown={onListKeyDown}
            className="max-h-[32rem] space-y-3 overflow-y-auto border-t border-rule pt-4"
          >
            {grouped.map(({ type, nodes }) => (
              <li key={type}>
                <p className="label text-ink-3">{type}</p>
                <ul className="mt-1 space-y-1">
                  {nodes.slice(0, MAX_LISTED).map((node) => (
                    <li key={node.id}>
                      <a
                        data-node=""
                        href={node.url || "#"}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelected(node.id);
                        }}
                        aria-current={selected === node.id ? "true" : undefined}
                        className={`block truncate px-2 py-1 text-sm transition-colors hover:bg-void-2 hover:text-gold ${
                          selected === node.id ? "text-gold" : "text-ink-2"
                        }`}
                      >
                        {node.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ── Graph ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="graph-depth" className="label text-gold">
            Depth
          </label>
          <select
            id="graph-depth"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Number(e.target.value))}
            className="border border-rule bg-void-2 px-2 py-1 text-ink focus:border-gold focus:outline-none"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTypeFilter(new Set());
              setRelFilter(new Set());
            }}
            className="label border border-rule px-3 py-1 text-ink-3 transition-colors hover:border-gold hover:text-gold"
          >
            Reset filters
          </button>
          {layout?.truncated && (
            <span className="label text-gold">node limit reached</span>
          )}
        </div>

        <div className="mt-4 border border-rule bg-void-2">
          {mounted && layout ? (
            <svg
              viewBox="0 0 720 560"
              className="block h-auto w-full"
              role="img"
              aria-label={`Graph neighbourhood of ${labelFor(selected!)}`}
            >
              {layout.edges.map((e) => {
                const a = layout.positions[e.from];
                const b = layout.positions[e.to];
                if (!a || !b) return null;
                return (
                  <line
                    key={e.id}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={e.status === "proposed" ? "#8a6d2f" : "#3a3f47"}
                    strokeWidth={e.status === "proposed" ? 1.5 : 1}
                    strokeDasharray={e.status === "proposed" ? "4 3" : undefined}
                  />
                );
              })}
              {Object.values(layout.positions).map((p) => {
                const node = data.nodes.find((n) => n.id === p.id);
                if (!node) return null;
                const isSelected = p.id === selected;
                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.x},${p.y})`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.label} (${node.type})`}
                    onClick={() => setSelected(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(p.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <circle
                      r={TYPE_RADII[node.type] + (isSelected ? 4 : 0)}
                      fill={TYPE_COLORS[node.type]}
                      stroke={isSelected ? "#f5f5f4" : "none"}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                    <text
                      y={TYPE_RADII[node.type] + 14}
                      textAnchor="middle"
                      className="fill-ink-2 font-mono"
                      fontSize={10}
                    >
                      {node.label.length > 26
                        ? `${node.label.slice(0, 25)}…`
                        : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <p className="p-8 text-ink-3">
              Select an entity to draw its neighbourhood.
            </p>
          )}
        </div>

        <p className="label mt-3 text-ink-3">
          Click a node or a list entry. Arrow keys move through the list; Enter
          selects. Edges are typed and carry provenance.
        </p>
      </div>

      {/* ── Detail panel ───────────────────────────────────────────────────── */}
      <aside
        aria-live="polite"
        className="border border-rule bg-void-2 p-5"
      >
        {!selectedNode ? (
          <p className="text-ink-3">
            No entity selected. Choose one from the list or the graph.
          </p>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="label text-gold">{selectedNode.type}</p>
              <h2 className="display-md mt-2 break-words">
                {selectedNode.label}
              </h2>
              {selectedNode.url && (
                <a
                  href={selectedNode.url}
                  className="mt-2 block break-all font-mono text-sm text-gold hover:underline"
                >
                  {selectedNode.url}
                </a>
              )}
              <p className="label mt-2 text-ink-3">
                {selectedNode.degree} relation
                {selectedNode.degree === 1 ? "" : "s"}
              </p>
            </div>

            <div>
              <p className="label text-gold">Relationships</p>
              {selectedEdges.length === 0 ? (
                <p className="mt-2 text-sm text-ink-3">None in the graph.</p>
              ) : (
                <ul className="mt-2 space-y-3">
                  {selectedEdges.map((e) => (
                    <li key={e.id} className="border-t border-rule pt-3">
                      <button
                        type="button"
                        onClick={() => setSelected(otherNode(e))}
                        className="text-left text-sm text-ink transition-colors hover:text-gold"
                      >
                        <span className="font-mono text-gold">{e.type}</span>{" "}
                        → {labelFor(otherNode(e))}
                      </button>
                      <p className="label mt-1 text-ink-3">
                        {e.status} · {e.verification}
                        {e.source ? ` · ${e.source}` : ""}
                        {e.fingerprint ? ` · ${e.fingerprint}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="label text-gold">
                Claims {bundlesLoaded ? `(${selectedClaims.length})` : ""}
              </p>
              {selectedClaims.length === 0 ? (
                <p className="mt-2 text-sm text-ink-3">
                  {bundlesLoaded
                    ? "No claim references this entity."
                    : "Loading claims…"}
                </p>
              ) : (
                <ul className="mt-2 space-y-4">
                  {selectedClaims.map((c) => (
                    <li key={c.id} className="border-t border-rule pt-3">
                      <p className="text-sm text-ink">{c.statement}</p>
                      <p className="label mt-1 text-ink-3">
                        {c.assessment} · {c.verification} ·{" "}
                        {c.authoritative ? "authoritative" : "proposed"}
                      </p>
                      <p className="label mt-1 break-all text-ink-3">
                        {c.provenance.source} · {c.provenance.fingerprint}
                      </p>
                      {c.supportingEvidence.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {c.supportingEvidence.map((id) => {
                            const ev: Evidence | undefined = evidenceById.get(id);
                            if (!ev) return null;
                            return (
                              <li key={id} className="text-xs text-ink-3">
                                <span className="font-mono text-gold">
                                  {ev.type}
                                </span>{" "}
                                {ev.span ?? ev.source} — {ev.verification.status} (
                                {ev.verification.method})
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
