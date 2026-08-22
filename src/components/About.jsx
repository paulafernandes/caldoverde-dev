import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";
import Image from "next/image";

export default function About() {
  const { language } = useLanguage();
  const text = translations[language].about;
  const imageText = translations[language].images;

  return (
    <section className="about-section" id="restaurante">
      <div className="about-container">
        <div className="about-content">
          <p className="about-subtitle">
            {text.subtitle}
          </p>

          <h2>{text.title}</h2>

          <p className="about-description">
            {text.description}
          </p>

          <ul className="about-features">
            {text.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <a className="about-button" href="#ementa">
            {text.button}
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="about-images">
          <Image
            className="about-image-main"
            src="/assets/images/bg/douro-about-526x548.webp"
            alt={imageText.douro}
            width={526}
            height={548}
          />

          <Image
            className="about-image-secondary"
            src="/assets/images/bg/alentejo-about-306x244.png"
            alt={imageText.alentejo}
            width={306}
            height={244}
          />
        </div>
      </div>
    </section>
  );
}