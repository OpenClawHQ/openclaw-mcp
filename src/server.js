/**
 * MCP Server Implementation
 *
 * A JSON-RPC 2.0 server that listens on stdin/stdout and exposes
 * SKILL.md files as MCP tools.
 *
 * Implements the Model Context Protocol specification:
 * - tools/list: Returns available tools
 * - tools/call: Executes a tool with arguments
 */

import fs from 'fs/promises';
import path from 'path';
import { parseSkillFromFile } from './parser.js';
import { skillToMCPTool } from './converter.js';

/**
 * Create an MCP server for hosting skills.
 *
 * @param {string} skillsDirectory - Path to directory containing SKILL.md files
 * @returns {Promise<Object>} Server instance with methods:
 *         - start(): Start the server (listen on stdin/stdout)
 *         - loadSkills(): Reload skills from directory
 *         - getTools(): Get list of available tools
 *
 * @throws {Error} If directory doesn't exist
 */
export async function createServer(skillsDirectory) {
  // Validate directory exists
  try {
    await fs.access(skillsDirectory);
  } catch {
    throw new Error(`Skills directory not found: ${skillsDirectory}`);
  }

  const server = {
    skillsDirectory,
    tools: [],
    skillMap: new Map(), // skill name → tool definition

    /**
     * Load all SKILL.md files from the directory.
     */
    async loadSkills() {
      this.tools = [];
      this.skillMap.clear();

      try {
        const entries = await fs.readdir(this.skillsDirectory, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith('.md')) {
            try {
              const filePath = path.join(this.skillsDirectory, entry.name);
              const skill = await parseSkillFromFile(filePath);
              const tool = skillToMCPTool(skill);
              this.tools.push(tool);
              this.skillMap.set(tool.name, tool);
            } catch (error) {
              console.error(`[MCP] Error loading skill ${entry.name}: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.error(`[MCP] Error reading directory: ${error.message}`);
      }

      return this.tools;
    },

    /**
     * Get the list of available tools.
     *
     * @returns {Array<Object>} Array of MCP tool definitions
     */
    getTools() {
      return this.tools;
    },

    /**
     * Start the MCP server.
     *
     * Listens on stdin for JSON-RPC 2.0 requests and responds on stdout.
     * Implements:
     * - initialize: Initialize the server (return server info)
     * - tools/list: Return list of available tools
     * - tools/call: Execute a tool (TODO: implement)
     * - notifications/shutdown: Graceful shutdown
     */
    async start() {
      console.error('[MCP Server] Starting...');

      // Load skills from directory
      await this.loadSkills();
      console.error(`[MCP Server] Loaded ${this.tools.length} tools`);

      // TODO: Implement JSON-RPC 2.0 server on stdin/stdout
      // - Create readline interface on stdin
      // - Parse JSON-RPC requests
      // - Dispatch to handler methods
      // - Send JSON-RPC responses to stdout
      //
      // Request handlers:
      // - initialize: { id, method: 'initialize', params: { ... } }
      // - tools/list: { id, method: 'tools/list' }
      // - tools/call: { id, method: 'tools/call', params: { name, arguments } }
      // - shutdown: Signal graceful shutdown

      console.error('[MCP Server] TODO: JSON-RPC 2.0 server not yet implemented');

      // For now, prevent process exit during development
      // await new Promise(() => {}); // Never resolves
    },

    /**
     * Handle a JSON-RPC 2.0 request.
     *
     * @param {Object} request - JSON-RPC request object
     *        { id?, method: string, params?: any }
     * @returns {Object} JSON-RPC response or notification
     */
    handleRequest(request) {
      const { id, method, params } = request;

      try {
        switch (method) {
          case 'initialize':
            return {
              id,
              result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                  tools: {
                    listChanged: false,
                  },
                },
                serverInfo: {
                  name: 'openclaw-mcp',
                  version: '0.1.0',
                },
              },
            };

          case 'tools/list':
            return {
              id,
              result: {
                tools: this.getTools(),
              },
            };

          case 'tools/call':
            // TODO: Implement tool execution
            // params: { name: string, arguments: { [key]: value } }
            return {
              id,
              error: {
                code: -32603,
                message: 'Tool execution not yet implemented',
              },
            };

          case 'notifications/shutdown':
            console.error('[MCP Server] Shutdown requested');
            process.exit(0);

          default:
            return {
              id,
              error: {
                code: -32601,
                message: `Method not found: ${method}`,
              },
            };
        }
      } catch (error) {
        return {
          id,
          error: {
            code: -32603,
            message: `Internal error: ${error.message}`,
          },
        };
      }
    },

    /**
     * Send a JSON-RPC response to stdout.
     */
    sendResponse(response) {
      process.stdout.write(JSON.stringify(response) + '\n');
    },
  };

  return server;
}

/**
 * Start an MCP server and listen on stdin.
 *
 * This is the main entry point for the MCP server.
 *
 * @param {string} skillsDirectory - Directory containing SKILL.md files
 */
export async function startServer(skillsDirectory) {
  const server = await createServer(skillsDirectory);
  await server.start();
}
