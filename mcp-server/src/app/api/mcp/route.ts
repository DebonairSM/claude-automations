import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "@/lib/server";

export const runtime = "nodejs";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!process.env.MCP_API_KEY || apiKey !== process.env.MCP_API_KEY) {
    return unauthorized();
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — safe for Vercel serverless
    enableJsonResponse: true,
  });

  const server = createServer();
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  await server.close();
  return response;
}

// Reject GET/DELETE — stateless mode has no persistent sessions
export async function GET() {
  return Response.json({ error: "Use POST for MCP requests" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: "Use POST for MCP requests" }, { status: 405 });
}
