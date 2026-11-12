import { getAgentResource, AGENT_CACHE_CONTROL } from "@/lib/agent-resources";

export const dynamic = "force-static";

const PATH = "/agents/index.json";

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
