import { getAgentResource, AGENT_CACHE_CONTROL } from "@/lib/agent-resources";

/* Non-authoritative proposals. Served separately so a consumer can never
   mistake a proposal for a declared relation. */
export const dynamic = "force-static";

const PATH = "/agents/proposals.json";

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
