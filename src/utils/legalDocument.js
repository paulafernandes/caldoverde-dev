// Documentos legais (política de privacidade, aviso legal): escolhe o texto a mostrar.
// Usa o idioma da página; se não tiver secções, o idioma predefinido do negócio.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function hasSections(entry) {
  return Array.isArray(entry?.sections) && entry.sections.length > 0;
}

export function resolveLegalDocument(document, lang, defaultLanguage) {
  if (hasSections(document[lang])) {
    return { ...document[lang], contentLanguage: lang };
  }

  if (hasSections(document[defaultLanguage])) {
    return {
      ...document[defaultLanguage],
      contentLanguage: defaultLanguage,
    };
  }

  return {
    title: document[lang]?.title ?? null,
    lastUpdated: null,
    sections: [],
    contentLanguage: lang,
  };
}

// Formata "AAAA-MM-DD" no servidor, para o HTML do servidor e do browser serem iguais.
export function formatLegalDate(value, locale) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(locale.replace(/_/g, "-"), {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return value;
  }
}
