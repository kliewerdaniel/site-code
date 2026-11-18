import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Exhibit, Kicker } from "@/components/Archetypes";
import { GraphExplorer } from "@/components/GraphExplorer";
import { SITE } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { CHAPTERS } from "@/lib/chapters";
import { CONCEPTS, PATHS, PROJECTS } from "@/lib/taxonomy";
import { relationGraph } from "@/lib/relations";
import {
  buildExplorerData,
  defaultSelection,
  type ExplorerInput,
} from "@/lib/explorer-core";
import { breadcrumbSchema, seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Knowledge graph",
  description:
    "Explore the compiled corpus as a typed graph: concepts, projects, articles, claims, evidence and the provenance of every relation.",
  path: "/graph",
});

/** The graph the explorer renders — built from the same sources as the
 *  machine-readable artifacts, never a second hand-authored graph. */
function explorerInput(): ExplorerInput {
  const graph = relationGraph();
  return {
    articles: getAllPosts().map((p) => ({
      slug: p.slug,
      title: p.title,
      url: `${SITE.url}/blog/${p.slug}`,
    })),
    projects: PROJECTS.map((p) => ({
      slug: p.slug,
      name: p.name,
      url: `${SITE.url}/projects/${p.slug}`,
    })),
    concepts: CONCEPTS.map((c) => ({
      slug: c.slug,
      name: c.name,
      url: `${SITE.url}/concepts/${c.slug}`,
    })),
    paths: PATHS.map((p) => ({
      slug: p.slug,
      name: p.name,
      url: `${SITE.url}/paths/${p.slug}`,
    })),
    chapters: CHAPTERS.map((c) => ({
      n: c.n,
      title: c.title,
      url: `${SITE.url}/book`,
    })),
    edges: [...Object.values(graph.edges).flat(), ...graph.proposed],
  };
}

export default function GraphPage() {
  const data = buildExplorerData(explorerInput());
  const initialSelected = defaultSelection(data);
  const edgeTotal = data.edges.length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Knowledge graph", path: "/graph" },
          ]),
        }}
      />

      <section className="border-b border-rule">
        <Container className="py-16 md:py-24">
          <Kicker>Knowledge graph</Kicker>
          <h1 className="display-lg mt-6 max-w-3xl">
            Follow the relations, then check the evidence.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">
            This is the compiled corpus as a graph: {data.nodes.length} entities
            and {edgeTotal} typed relations, generated at build time from the same
            source the pages render. Select a concept, follow a relation, open a
            claim, and read the evidence it rests on. Every edge carries its
            provenance; a proposed edge is drawn dashed and is never authoritative.
          </p>
        </Container>
      </section>

      <Exhibit wide>
        <GraphExplorer data={data} initialSelected={initialSelected} />
      </Exhibit>

      <Exhibit>
        <Kicker>How to read it</Kicker>
        <h2 className="display-md mt-5">Provenance is not decoration</h2>
        <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-2">
          <p>
            <strong className="text-ink">Nodes</strong> are concepts, projects,
            articles, learning paths and book chapters. Size and colour encode
            type; the centre is your selection.
          </p>
          <p>
            <strong className="text-ink">Edges</strong> are typed relations from{" "}
            <code className="font-mono text-base text-gold">/agents/graph.json</code>.
            A solid edge is declared; a dashed edge is a non-authoritative
            proposal. Each lists its status, verification, declaring source and
            modification fingerprint.
          </p>
          <p>
            <strong className="text-ink">Claims</strong> are the epistemic layer:{" "}
            <code className="font-mono text-base text-gold">/agents/claims.json</code>{" "}
            and{" "}
            <code className="font-mono text-base text-gold">/agents/evidence.json</code>.
            A claim states what its evidence establishes; a proposed claim is
            labelled proposed and never presented as fact.
          </p>
        </div>
      </Exhibit>
    </>
  );
}
