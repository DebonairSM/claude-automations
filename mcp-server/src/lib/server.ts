import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listSkills, getSkill, listAgents, getAgent } from "./github";

export function createServer() {
  const server = new McpServer({ name: "vsol-skills", version: "1.0.0" });

  server.tool("list_skills", "List all VSol skills with their names and descriptions", async () => {
    const skills = await listSkills();
    return { content: [{ type: "text", text: JSON.stringify(skills, null, 2) }] };
  });

  server.tool(
    "get_skill",
    "Get the full SKILL.md content for a named skill",
    { name: z.string().describe("Skill folder name, e.g. windows-performance-tuning") },
    async ({ name }) => {
      const content = await getSkill(name);
      return { content: [{ type: "text", text: content }] };
    }
  );

  server.tool("list_agents", "List all VSol agents with their names and descriptions", async () => {
    const agents = await listAgents();
    return { content: [{ type: "text", text: JSON.stringify(agents, null, 2) }] };
  });

  server.tool(
    "get_agent",
    "Get the full content of a named agent",
    { name: z.string().describe("Agent name without .md, e.g. cowork-provisioner") },
    async ({ name }) => {
      const content = await getAgent(name);
      return { content: [{ type: "text", text: content }] };
    }
  );

  return server;
}
