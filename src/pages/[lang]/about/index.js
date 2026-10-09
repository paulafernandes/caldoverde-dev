import Head from "next/head";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import translations from "../../../data/translations";
import { SITE_URL } from "../../../config/site";
import Image from "next/image";
import { getPublicBusinessSettings } from "../../../server/businessSettingsService";

export default function AboutPage({ lang, businessSettings }) {
  const text = translations[lang].aboutPage;
  const seoData = text.seo;
  const canonicalUrl = `${SITE_URL}/${lang}/about`;
  const pageSuffix = "/about";

  const availableLanguages = businessSettings.languages.filter(
    ({ language }) =>
      Object.hasOwn(translations, language) &&
      translations[language]?.aboutPage?.seo &&
      translations[language]?.aboutPage?.imageAlt
  );

  const currentLocale = availableLanguages.find(
    ({ language }) => language === lang
  )?.locale;

  const ogImageUrl = `${SITE_URL}/og-image.png`;
  const alternateLocales = availableLanguages
    .filter(({ language }) => language !== lang)
    .map(({ locale }) => locale.replace(/-/g, "_"));

  return (
    <>
      <Head>
        <title>{seoData.title}</title>

        <meta name="description" content={seoData.description} />

        <link rel="canonical" href={canonicalUrl} />

        {availableLanguages.map(({ language }) => (
          <link
            key={`alternate-${language}`}
            rel="alternate"
            hrefLang={language}
            href={`${SITE_URL}/${language}${pageSuffix}`}
          />
        ))}

        {availableLanguages.some(
          ({ language }) => language === businessSettings.defaultLanguage
        ) && (
          <link
            key="alternate-default"
            rel="alternate"
            hrefLang="x-default"
            href={`${SITE_URL}/${businessSettings.defaultLanguage}${pageSuffix}`}
          />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:type" content="website" />

        <meta property="og:title" content={seoData.title} />

        <meta property="og:description" content={seoData.description} />

        <meta property="og:url" content={canonicalUrl} />

        <meta property="og:site_name" content={businessSettings.name} />

        <meta property="og:image" content={ogImageUrl} />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />

        <meta
          property="og:image:alt"
          content={translations[lang].images.logo}
        />

        {currentLocale && (
          <meta
            property="og:locale"
            content={currentLocale.replace(/-/g, "_")}
          />
        )}

        {alternateLocales.map((locale) => (
          <meta
            key={`og-locale-alternate-${locale}`}
            property="og:locale:alternate"
            content={locale}
          />
        ))}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={seoData.title} />

        <meta name="twitter:description" content={seoData.description} />

        <meta name="twitter:image" content={ogImageUrl} />

      </Head>

      <Header businessSettings={businessSettings} />

      <main id="main-content" tabIndex={-1}>
        <section className="about-page">
          <div className="about-page-container">
            <header className="about-page-header">
              <h1>{text.title}</h1>
            </header>

            <blockquote className="about-page-quote">
              <p>{text.quote}</p>
              <footer>{text.quoteAuthor}</footer>
            </blockquote>

            <div className="about-page-text">
              <figure
                className="
      about-page-inline-image
      about-page-inline-image-left
    "
              >
                <Image
                  src="/assets/images/bg/alexandre_avo_prazeres.png"
                  alt={text.imageAlt.memories}
                  title={text.imageAlt.memories}
                  width={941}
                  height={1354}
                  sizes="(max-width: 750px) calc(100vw - 32px), 345px"
                />
              </figure>

              <p>{text.paragraphs[0]}</p>

              <p className="about-page-lead">{text.paragraphs[1]}</p>

              <p>{text.paragraphs[2]}</p>

              <figure
                className="
      about-page-inline-image
      about-page-inline-image-right
    "
              >
                <Image
                  src="/assets/images/bg/avo-prazeres.png"
                  alt={text.imageAlt.portrait}
                  title={text.imageAlt.portrait}
                  width={941}
                  height={1431}
                  sizes="(max-width: 750px) calc(100vw - 32px), 345px"
                />
              </figure>

              {text.paragraphs.slice(3, -1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="about-page-closing">
              <p>{text.paragraphs[text.paragraphs.length - 1]}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer businessSettings={businessSettings} />
    </>
  );
}

export async function getServerSideProps({ params }) {
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
        destination: `/${defaultLanguage}/about`,
        permanent: false,
      },
    };
  }

  if (
    !Object.hasOwn(translations, lang) ||
    !translations[lang]?.aboutPage?.seo ||
    !translations[lang]?.aboutPage?.imageAlt
  ) {
    return { notFound: true };
  }

  return {
    props: {
      lang,
      businessSettings,
    },
  };
}
