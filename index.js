/**
 * 网络工程师助手 for DeepSeek Harness.
 *
 * Registers the bundled `network-command-kb` skill on `ctx.skills`: the skill
 * instructs the agent to search the 40 command reference documents shipped in
 * this package's `kb/` directory, and the harness resolves the skill's base
 * directory at load time, so the knowledge base stays portable with the
 * plugin. The companion "网络工程师助手" agent preset is declared in
 * `cordis.patch.yml` as a `@deepseek-ai/dsh-agent-preset` row and needs no
 * code.
 *
 * The plugin imports nothing but Node builtins. A third-party plugin cannot
 * rely on `@deepseek-ai/*` packages resolving from its own directory — they
 * are nested inside the dsh installation — so registries are reached through
 * `ctx` alone.
 *
 * @module dsh-network-engineer
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'network-engineer'

/** The registry this plugin registers into. */
export const inject = ['skills']

const packageRoot = dirname(fileURLToPath(import.meta.url))
const skillDir = resolve(packageRoot, 'skills', 'network-command-kb')

/**
 * Split a `SKILL.md` into its frontmatter block and body.
 * @param content - the raw file text.
 * @returns the frontmatter text (empty when absent) and the trimmed body.
 */
function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (match === null) return { frontmatter: '', body: content.trim() }
  return { frontmatter: match[1], body: match[2].trim() }
}

/**
 * Read one-line scalar frontmatter keys. The bundled SKILL.md deliberately
 * keeps `name` and `description` on single lines, so no block-scalar support
 * is needed here.
 * @param frontmatter - the frontmatter text without its `---` delimiters.
 * @returns the parsed string values by key.
 */
function parseFields(frontmatter) {
  const fields = {}
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (match !== null && match[2] !== '') fields[match[1]] = match[2].trim()
  }
  return fields
}

/**
 * Register the bundled knowledge-base skill.
 * @param ctx - plugin context; the registration is disposed with it.
 */
export function apply(ctx) {
  let raw
  try {
    raw = readFileSync(join(skillDir, 'SKILL.md'), 'utf8')
  } catch (error) {
    // A missing SKILL.md only disables the skill, so warn and keep the plugin
    // loadable; the preset row in cordis.patch.yml is unaffected.
    ctx.logger.warn(`network-engineer: cannot read SKILL.md under ${skillDir}: ${error instanceof Error ? error.message : String(error)}`)
    return
  }

  const { frontmatter, body } = splitFrontmatter(raw)
  const fields = frontmatter === '' ? {} : parseFields(frontmatter)
  if (fields.name === undefined || fields.description === undefined || body === '') {
    ctx.logger.warn('network-engineer: SKILL.md requires non-empty name, description and body; skill not registered')
    return
  }

  ctx.skills.register({
    name: fields.name,
    description: fields.description,
    content: body,
    source: 'bundled',
    path: join(skillDir, 'SKILL.md'),
    resourceBase: { kind: 'directory', path: skillDir },
  })
}
