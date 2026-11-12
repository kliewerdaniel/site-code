import { getAgentResource, AGENT_CACHE_CONTROL } from "@/lib/agent-resources";

/* Build-time generated: the full catalog as text. Deliberately a catalog, not
   the 6.8 MB of article bodies — see src/lib/agent-resources-core.ts. */
export const dynamic = "force-static";

const PATH = "/llms-full.txt";

export async function GET() {
  const resource = getAgentResource(PATH);
  if (!resource) return new Response("not found", { status: 404 });
  return new Response(resource.body, {
    headers: {
      "Content-Type": resource.contentType,
      "Cache-Control": AGENT_CACHE_CONTROL,
    },
  });
}
