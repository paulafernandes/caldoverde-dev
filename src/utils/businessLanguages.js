export function getBusinessLanguageOption({ language, locale }) {
  const code = language;
  let label = code;
  let flag = code.toUpperCase();

  try {
    const languageTag = code.replace(/_/g, "-");

    label =
      new Intl.DisplayNames([languageTag], {
        type: "language",
      }).of(languageTag) ?? code;
  } catch {
    // Mantém o código se não for possível obter o nome.
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
