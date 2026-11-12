import { getAgentResource, AGENT_CACHE_CONTROL } from "@/lib/agent-resources";

/* Build-time generated: this route is a pure function of the archive and the
   taxonomy, so it is prerendered once and served from the edge. */
export const dynamic = "force-static";

const PATH = "/llms.txt";

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
