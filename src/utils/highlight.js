/**
 * Escapes special regex characters in a string for use in RegExp.
 * @param {string} s
 * @returns {string}
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Splits text into segments: plain text and matches of the query (case-insensitive).
 * @param {string} text
 * @param {string} query - raw search query (will be escaped for regex)
 * @returns {{ type: 'text' | 'match'; value: string }[]}
 */
export function getHighlightSegments(text, query) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: text || '' }]
  const q = (query || '').trim()
  if (!q) return [{ type: 'text', value: text }]
  const escaped = escapeRegex(q)
  const re = new RegExp(`(${escaped})`, 'gi')
  const segments = []
  let lastIndex = 0
  let match
  const reCopy = new RegExp(re.source, re.flags)
  while ((match = reCopy.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'match', value: match[1] })
    lastIndex = reCopy.lastIndex
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }
  return segments.length ? segments : [{ type: 'text', value: text }]
}
