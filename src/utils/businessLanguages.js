// Idiomas que o admin pode acrescentar. Um só locale por idioma, porque o
// idioma é único por negócio. O label é fixo (autónimo do CLDR) para o
// servidor e o browser mostrarem o mesmo texto, seja qual for o seu ICU.
export const BUSINESS_LANGUAGE_CATALOG = Object.freeze([
  { language: "es", locale: "es_ES", label: "español" },
  { language: "pt", locale: "pt_PT", label: "português" },
  { language: "en", locale: "en_GB", label: "English" },
  { language: "fr", locale: "fr_FR", label: "français" },
  { language: "de", locale: "de_DE", label: "Deutsch" },
  { language: "it", locale: "it_IT", label: "italiano" },
  { language: "ca", locale: "ca_ES", label: "català" },
  { language: "gl", locale: "gl_ES", label: "galego" },
  { language: "eu", locale: "eu_ES", label: "euskara" },
  { language: "nl", locale: "nl_NL", label: "Nederlands" },
]);

export function getBusinessLanguageOption({ language, locale }) {
  const code = language;
  let label =
    BUSINESS_LANGUAGE_CATALOG.find((entry) => entry.language === code)
      ?.label ?? code;
  let flag = code.toUpperCase();

  // Intl só fora do catálogo: os seus dados variam entre Node e browsers.
  if (label === code) {
    try {
      const languageTag = code.replace(/_/g, "-");

      label =
        new Intl.DisplayNames([languageTag], {
          type: "language",
        }).of(languageTag) ?? code;
    } catch {
      // Mantém o código se não for possível obter o nome.
    }
  }

  try {
    const region = new Intl.Locale(
      locale.replace(/_/g, "-")
    ).region;

    if (region && /^[A-Z]{2}$/.test(region)) {
      flag = String.fromCodePoint(
        ...[...region].map((letter) => letter.charCodeAt(0) + 127397)
      );
    }
  } catch {
    // Mantém o código quando o locale não permite obter uma bandeira.
  }

  return { code, label, flag };
}
