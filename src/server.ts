import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerResources } from "./resources.js";
import { registerTools } from "./tools/registerTools.js";

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "philly-civic-data-mcp",
      version: "0.1.0"
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );

  registerResources(server);
  registerTools(server);

  return server;
}
