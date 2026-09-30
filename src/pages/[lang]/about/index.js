import Head from "next/head";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import translations from "../../../data/translations";
import { useEffect } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import { SITE_URL } from "../../../config/site";
import Image from "next/image";

const supportedLanguages = ["pt", "es", "en"];

const openGraphLocales = {
  pt: "pt_PT",
  es: "es_ES",
  en: "en_GB",
};

const aboutImageAltTexts = {
  pt: {
    memories: "Alexandre com a avó Prazeres",
    portrait: "Alexandre com a avó Prazeres",
  },
  es: {
    memories: "Fotografía antigua de Alexandre con la abuela Prazeres",
    portrait: "Retrato de Alexandre con la abuela Prazeres",
  },
  en: {
    memories: "Old photograph of Alexandre with Grandmother Prazeres",
    portrait: "Portrait of Alexandre with Grandmother Prazeres",
  },
};

export default function AboutPage({ lang }) {
  const { changeLanguage } = useLanguage();

  useEffect(() => {
    changeLanguage(lang);
  }, [lang, changeLanguage]);

  const text = translations[lang].aboutPage;
  const seoData = text.seo;
  const canonicalUrl = `${SITE_URL}/${lang}/about`;

  return (
    <>
      <Head>
        <title>{seoData.title}</title>

        <meta name="description" content={seoData.description} />

        <link rel="canonical" href={canonicalUrl} />

        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/es/about`} />

        <link rel="alternate" hrefLang="pt" href={`${SITE_URL}/pt/about`} />

        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/about`} />

        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_URL}/es/about`}
        />

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:type" content="website" />

        <meta property="og:title" content={seoData.title} />

        <meta property="og:description" content={seoData.description} />

        <meta property="og:url" content={canonicalUrl} />

        <meta property="og:site_name" content="Caldo Verde" />

        <meta property="og:locale" content={openGraphLocales[lang]} />

        <link rel="icon" href="/logo_cv.ico" />
      </Head>

      <Header />

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
                  alt={aboutImageAltTexts[lang].memories}
                  title={aboutImageAltTexts[lang].memories}
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
                  alt={aboutImageAltTexts[lang].portrait}
                  title={aboutImageAltTexts[lang].portrait}
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
      <Footer />
    </>
  );
}
export async function getServerSideProps({ params }) {
  const { lang } = params;

  if (!supportedLanguages.includes(lang)) {
    return {
      redirect: {
        destination: "/es/about",
        permanent: false,
      },
    };
  }

  return {
    props: {
      lang,
    },
  };
}
