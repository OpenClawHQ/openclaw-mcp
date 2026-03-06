/**
 * openclaw-mcp main module
 *
 * Exports the core API for converting OpenClaw SKILL.md files to MCP tools.
 */

import { parseSkillFromFile } from './parser.js';
import { skillToMCPTool } from './converter.js';
import { createServer } from './server.js';

/**
 * Parse a SKILL.md file and extract its structure.
 *
 * @param {string} filePath - Absolute path to the SKILL.md file
 * @returns {Promise<{frontmatter: Object, body: string, path: string}>}
 *          A promise that resolves to an object containing:
 *          - frontmatter: Parsed YAML frontmatter as a JavaScript object
 *          - body: The markdown body content
 *          - path: The file path (for reference)
 *
 * @throws {Error} If the file cannot be read or parsed
 *
 * @example
 * const skill = await parseSkill('./skills/my-skill.md');
 * console.log(skill.frontmatter.name); // e.g., "My Skill"
 * console.log(skill.body); // Markdown content
 */
export async function parseSkill(filePath) {
  // TODO: Implement using parser.js
  // Should read file, extract YAML frontmatter, and return structured object
  console.log(`[parseSkill] TODO: Implement parsing for ${filePath}`);
  return {
    frontmatter: {},
    body: '',
    path: filePath,
  };
}

/**
 * Convert a parsed SKILL.md object to an MCP tool definition.
 *
 * Maps SKILL.md fields to MCP tool schema:
 * - name → tool name
 * - description → tool description
 * - requires.env → inputSchema properties and required fields
 *
 * @param {Object} skill - A parsed skill object from parseSkill()
 * @returns {Object} MCP tool definition with structure:
 *         {
 *           name: string,
 *           description: string,
 *           inputSchema: {
 *             type: "object",
 *             properties: { ... },
 *             required: [ ... ]
 *           }
 *         }
 *
 * @example
 * const skill = await parseSkill('./skills/my-skill.md');
 * const tool = convertToMCPTool(skill);
 * console.log(tool.name);        // MCP tool name
 * console.log(tool.inputSchema); // JSON Schema for inputs
 */
export function convertToMCPTool(skill) {
  // TODO: Implement using converter.js
  // Should transform skill object to MCP-compatible format
  console.log(`[convertToMCPTool] TODO: Implement conversion`);
  return {
    name: skill.frontmatter.name || 'unknown-tool',
    description: skill.frontmatter.description || '',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  };
}

/**
 * Create and start an MCP server hosting skills from a directory.
 *
 * Discovers all .md files in the directory, parses them as SKILL.md,
 * converts them to MCP tools, and exposes them via JSON-RPC 2.0 over stdio.
 *
 * The server implements:
 * - tools/list: Returns all available tools
 * - tools/call: Executes a tool with given arguments
 *
 * @param {string} skillsDirectory - Path to directory containing SKILL.md files
 * @returns {Promise<Object>} Server instance with start() method
 *
 * @example
 * const server = await createMCPServer('./skills');
 * // Server now listens on stdin/stdout
 *
 * @throws {Error} If directory doesn't exist or no skills found
 */
export async function createMCPServer(skillsDirectory) {
  // TODO: Implement using server.js
  // Should create a JSON-RPC 2.0 server listening on stdio
  console.log(`[createMCPServer] TODO: Implement server for ${skillsDirectory}`);
  return {
    start: async () => {
      console.log('[createMCPServer] TODO: Implement server startup');
    },
  };
}

export { parseSkillFromFile } from './parser.js';
export { skillToMCPTool } from './converter.js';
