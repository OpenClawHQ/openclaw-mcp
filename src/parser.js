/**
 * SKILL.md Parser
 *
 * Parses SKILL.md files which have the format:
 *
 * ---
 * name: Skill Name
 * description: A brief description
 * version: 1.0.0
 * requires:
 *   env:
 *     - VAR_NAME
 * ---
 *
 * # Markdown Body
 *
 * The body contains markdown-formatted documentation.
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Parse YAML frontmatter from a string.
 *
 * Extracts content between opening and closing --- markers.
 * Parses YAML manually (no external dependencies).
 *
 * @param {string} content - File content with frontmatter
 * @returns {Object} { frontmatter, body }
 *          - frontmatter: Parsed YAML as JavaScript object
 *          - body: Content after the closing ---
 *
 * @example
 * const { frontmatter, body } = parseFrontmatter(fileContent);
 * console.log(frontmatter.name);
 */
function parseFrontmatter(content) {
  const lines = content.split('\n');

  // Find opening ---
  if (lines[0].trim() !== '---') {
    return { frontmatter: {}, body: content };
  }

  // Find closing ---
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { frontmatter: {}, body: content };
  }

  const yamlLines = lines.slice(1, endIndex);
  const body = lines.slice(endIndex + 1).join('\n');

  const frontmatter = parseYAML(yamlLines.join('\n'));

  return { frontmatter, body };
}

/**
 * Simple YAML parser for SKILL.md frontmatter.
 *
 * Supports:
 * - Simple key: value pairs
 * - Nested objects (indentation-based)
 * - Arrays
 *
 * @param {string} yamlContent - YAML string
 * @returns {Object} Parsed YAML as JavaScript object
 *
 * @example
 * const obj = parseYAML('name: MySkill\nversion: 1.0.0');
 * console.log(obj.name); // "MySkill"
 */
function parseYAML(yamlContent) {
  const result = {};
  const lines = yamlContent.split('\n').filter((l) => l.trim());

  let currentObject = result;
  const stack = [{ object: result, indent: 0 }];

  for (const line of lines) {
    const match = line.match(/^(\s*)(.+?):\s*(.*)$/);
    if (!match) continue;

    const [, indentStr, key, value] = match;
    const indent = indentStr.length;

    // Pop stack if indent decreased
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    currentObject = stack[stack.length - 1].object;

    if (value.trim().startsWith('[')) {
      // Array notation: key: [item1, item2]
      const arrayContent = value.trim().slice(1, -1);
      currentObject[key] = arrayContent
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (value.trim() === '') {
      // Nested object (value on next line with more indentation)
      currentObject[key] = {};
      stack.push({ object: currentObject[key], indent });
    } else {
      // Simple value
      currentObject[key] = parseValue(value.trim());
    }
  }

  return result;
}

/**
 * Parse a YAML value, handling different types.
 *
 * @param {string} value - The value string
 * @returns {*} Parsed value (string, number, boolean, etc.)
 */
function parseValue(value) {
  if (value === 'null' || value === '') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(value) && value !== '') return Number(value);
  return value;
}

/**
 * Parse a SKILL.md file from disk.
 *
 * @param {string} filePath - Absolute path to SKILL.md file
 * @returns {Promise<Object>} { frontmatter, body, path }
 *
 * @throws {Error} If file cannot be read
 */
export async function parseSkillFromFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  return { frontmatter, body, path: filePath };
}

/**
 * Parse SKILL.md content from a string.
 *
 * @param {string} content - SKILL.md file content
 * @param {string} [filePath] - Optional path for reference
 * @returns {Object} { frontmatter, body, path }
 */
export function parseSkillFromString(content, filePath = '<string>') {
  const { frontmatter, body } = parseFrontmatter(content);
  return { frontmatter, body, path: filePath };
}

/**
 * Internal parser exports for testing
 */
export { parseFrontmatter, parseYAML, parseValue };
