import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const { language } = useLanguage();
  const text = translations[language].footer;
  const imageText = translations[language].images;

  const reservationEmail =
    `mailto:info@caldoverde.es?subject=${encodeURIComponent(
      text.reservationSubject
    )}`;

  return (
    <footer className="site-footer" id="contactos">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand">
            <Link href={`/${language}/`} className="footer-logo">
              <Image
                src="/assets/images/logo_completo.png"
                alt={imageText.logo}
                width={384}
                height={100}
              />
            </Link>
            <p>{text.description}</p>
          </div>

          <div className="footer-column">
            <h2>{text.contactTitle}</h2>

            <div className="footer-contact-item">
              <span className="footer-label">
                {text.emailLabel}
              </span>

              <a href="mailto:info@caldoverde.es">
                info@caldoverde.es
              </a>
            </div>

            <div className="footer-contact-item">
              <span className="footer-label">
                {text.phoneLabel}
              </span>

              <span>{text.phonePending}</span>
            </div>

            <div className="footer-contact-item">
              <span className="footer-label">
                {text.addressLabel}
              </span>

              <address>{text.addressPending}</address>
            </div>
          </div>

          <div className="footer-column" id="reservas">
            <h2>{text.reservationsTitle}</h2>

            <div className="footer-contact-item">
              <span className="footer-label">
                {text.hoursLabel}
              </span>

              <span>{text.hoursPending}</span>
            </div>

            <p className="footer-reservation-text">
              {text.reservationText}
            </p>

            <a
              className="footer-reservation-button"
              href={reservationEmail}
            >
              {text.reservationButton}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © {currentYear} Restaurante Caldo Verde.{" "}
            {text.rightsReserved}
          </p>

          <a href="/politica-de-privacidade">
            {text.privacyPolicy}
          </a>
        </div>
      </div>
    </footer>
  );
}