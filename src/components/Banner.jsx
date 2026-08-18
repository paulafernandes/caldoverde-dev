import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";

export default function Banner() {
  const { language } = useLanguage();
  const text = translations[language].banner;

  return (
    <section className="hero-banner" id="inicio">
      <video
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source
          src="/assets/video/slow_mo.mp4"
          type="video/mp4"
        />
      </video>

      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="hero-subtitle">
          {text.subtitle}
        </p>

        <h1>{text.title}</h1>

        <a className="hero-button" href="#restaurante">
          {text.button}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}