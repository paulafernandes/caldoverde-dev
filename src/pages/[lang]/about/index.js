import Head from "next/head";
import { useRouter } from "next/router";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import translations from "../../../data/translations";
import { useEffect } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import { SITE_URL } from "../../../config/site";

const supportedLanguages = ["pt", "es", "en"];

const openGraphLocales = {
  pt: "pt_PT",
  es: "es_ES",
  en: "en_GB",
};

export default function AboutPage() {
  const router = useRouter();
  const { lang } = router.query;
  const { changeLanguage } = useLanguage();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!supportedLanguages.includes(lang)) {
      router.replace("/es/about");
      return;
    }

    changeLanguage(lang);
  }, [lang, router.isReady]);

  if (!router.isReady || !supportedLanguages.includes(lang)) {
    return null;
  }

  const text = translations[lang].aboutPage;
  const seoData = text.seo;
  const canonicalUrl = `${SITE_URL}/${lang}/about`;

  return (
    <>
      <Head>
        <title>{seoData.title}</title>

        <meta
          name="description"
          content={seoData.description}
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />

        <link
          rel="alternate"
          hrefLang="es"
          href={`${SITE_URL}/es/about`}
        />

        <link
          rel="alternate"
          hrefLang="pt"
          href={`${SITE_URL}/pt/about`}
        />

        <link
          rel="alternate"
          hrefLang="en"
          href={`${SITE_URL}/en/about`}
        />

        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_URL}/es/about`}
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <meta property="og:type" content="website" />

        <meta
          property="og:title"
          content={seoData.title}
        />

        <meta
          property="og:description"
          content={seoData.description}
        />

        <meta
          property="og:url"
          content={canonicalUrl}
        />

        <meta
          property="og:site_name"
          content="Caldo Verde"
        />

        <meta
          property="og:locale"
          content={openGraphLocales[lang]}
        />

        <link rel="icon" href="/logo_cv.ico" />
      </Head>

      <Header />

      <main>
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
              <p>{text.paragraphs[0]}</p>

              <p className="about-page-lead">
                {text.paragraphs[1]}
              </p>

              <p>{text.paragraphs[2]}</p>

              <figure className="about-page-inline-image">
                <img
                  src="/assets/images/bg/douro-about-526x548.webp"
                  alt=""
                  width="526"
                  height="548"
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