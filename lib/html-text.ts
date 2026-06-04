/**
 * Minimal, dependency-free HTML → readable paragraphs.
 *
 * Blog bodies come back as HTML/Markdown from the CMS. We don't ship a heavy
 * HTML renderer; instead we turn block-level tags into paragraph breaks, strip
 * the rest, and decode the common entities so the text reads cleanly in <Text>.
 */

const NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
};

function decodeEntities(input: string): string {
  let out = input;
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    out = out.split(entity).join(char);
  }
  // Numeric entities: &#123; and &#x1F;
  out = out.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
  return out;
}

/** Split an HTML string into an array of plain-text paragraphs. */
export function htmlToParagraphs(html?: string | null): string[] {
  if (!html) return [];
  let text = html;

  // Drop script/style blocks entirely.
  text = text.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  // Block boundaries → double newline (paragraph break).
  text = text.replace(/<\/(p|div|h[1-6]|li|blockquote|tr|section|article)>/gi, '\n\n');
  // Soft breaks → single newline.
  text = text.replace(/<br\s*\/?>/gi, '\n');
  // List items get a bullet prefix.
  text = text.replace(/<li[^>]*>/gi, '• ');
  // Strip all remaining tags.
  text = text.replace(/<[^>]+>/g, '');
  text = decodeEntities(text);

  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t]+/g, ' ').replace(/\n+/g, '\n').trim())
    .filter((p) => p.length > 0);
}

/** First N characters of the plain text — used as a fallback excerpt. */
export function htmlToExcerpt(html?: string | null, max = 160): string {
  const paras = htmlToParagraphs(html);
  const joined = paras.join(' ');
  if (joined.length <= max) return joined;
  return `${joined.slice(0, max).trimEnd()}…`;
}
