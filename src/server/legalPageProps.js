import translations from "../data/translations";
import { getPublicBusinessSettings } from "./businessSettingsService";
import { formatLegalDate, resolveLegalDocument } from "../utils/legalDocument";

// getServerSideProps partilhado das páginas legais (política de privacidade, aviso legal).
// document: texto por idioma; path: caminho depois de /[lang]; textKey: chave em translations com o seo.
export async function getLegalPageProps(
  { params },
  { document, path, textKey }
) {
  const { lang } = params;

  if (!Object.hasOwn(translations, lang)) {
    return { notFound: true };
  }

  const businessSettings = await getPublicBusinessSettings();

  if (!businessSettings) {
    return { notFound: true };
  }

  const { languages, defaultLanguage } = businessSettings;

  const isDefaultLanguageEnabled = languages.some(
    ({ language }) => language === defaultLanguage
  );

  if (!isDefaultLanguageEnabled) {
    return { notFound: true };
  }

  const isLanguageEnabled = languages.some(({ language }) => language === lang);

  if (!isLanguageEnabled) {
    return {
      redirect: {
        destination: `/${defaultLanguage}/${path}`,
        permanent: false,
      },
    };
  }

  if (!translations[lang]?.[textKey]?.seo) {
    return { notFound: true };
  }

  const resolvedDocument = resolveLegalDocument(
    document,
    lang,
    defaultLanguage
  );

  // O texto do idioma predefinido só serve se houver traduções de interface para ele.
  const legalDocument = Object.hasOwn(
    translations,
    resolvedDocument.contentLanguage
  )
    ? resolvedDocument
    : resolveLegalDocument(document, lang, lang);

  const contentLocale =
    languages.find(({ language }) => language === legalDocument.contentLanguage)
      ?.locale ?? legalDocument.contentLanguage;

  const lastUpdatedText = formatLegalDate(
    legalDocument.lastUpdated,
    contentLocale
  );

  return {
    props: {
      lang,
      businessSettings,
      legalDocument: {
        title: legalDocument.title ?? null,
        lastUpdated: lastUpdatedText ? legalDocument.lastUpdated : null,
        lastUpdatedText,
        sections: legalDocument.sections,
        contentLanguage: legalDocument.contentLanguage,
      },
    },
  };
}
