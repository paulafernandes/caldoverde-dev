// Formatação mínima dos textos legais: [texto](url) e **negrito**.
// Devolve elementos React (o texto é escapado pelo React); sem HTML em bruto.
// Só aceita ligações https://, http:// e mailto:; outras ficam como texto simples.

const LINK_PATTERN = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const INLINE_PATTERN = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+?)\*\*/g;
const ALLOWED_URL_PATTERN = /^(https?:\/\/|mailto:)/i;
const EXTERNAL_URL_PATTERN = /^https?:\/\//i;

function renderLink(label, url, key, opensInNewTabText) {
  const href = url.trim();

  if (!ALLOWED_URL_PATTERN.test(href)) {
    return label;
  }

  if (EXTERNAL_URL_PATTERN.test(href)) {
    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} (${opensInNewTabText})`}
      >
        {label}
      </a>
    );
  }

  return (
    <a key={key} href={href}>
      {label}
    </a>
  );
}

function renderTokens(text, pattern, opensInNewTabText, keyPrefix) {
  const nodes = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const [fullMatch, linkLabel, linkUrl, boldText] = match;
    const key = `${keyPrefix}${match.index}`;

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (boldText !== undefined) {
      nodes.push(
        <strong key={key}>
          {renderTokens(boldText, LINK_PATTERN, opensInNewTabText, `${key}-`)}
        </strong>
      );
    } else {
      nodes.push(renderLink(linkLabel, linkUrl, key, opensInNewTabText));
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function renderInlineText(text, opensInNewTabText) {
  if (typeof text !== "string") {
    return null;
  }

  return renderTokens(text, INLINE_PATTERN, opensInNewTabText, "inline-");
}
