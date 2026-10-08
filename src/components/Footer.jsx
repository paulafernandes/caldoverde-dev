import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";
import Image from "next/image";
import {
  getBusinessAddressLines,
  getBusinessLocationUrl,
} from "../utils/businessAddress";

export default function Footer({ businessSettings }) {
  const currentYear = new Date().getFullYear();

  const { language } = useLanguage();
  const text = translations[language].footer;
  const imageText = translations[language].images;
  const addressLines = getBusinessAddressLines(businessSettings, language);
  const locationUrl = getBusinessLocationUrl(businessSettings);

  const reservationEmail = businessSettings?.email
    ? `mailto:${businessSettings.email}?subject=${encodeURIComponent(
        text.reservationSubject
      )}`
    : null;

  return (
    <footer className="site-footer" id="contactos">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand">
            <Link href={`/${language}`} className="footer-logo">
              <Image
                src="/assets/images/logo_dourado_andorinha.png"
                alt={imageText.logo}
                width={356}
                height={98}
              />
            </Link>
            <p>{text.description}</p>
          </div>

          <div className="footer-column">
            <h2>{text.contactTitle}</h2>

            {businessSettings?.email && (
              <div className="footer-contact-item">
                <span className="footer-label">{text.emailLabel}</span>

                <a href={`mailto:${businessSettings.email}`}>
                  {businessSettings.email}
                </a>
              </div>
            )}

            {businessSettings?.phone && (
              <div className="footer-contact-item">
                <span className="footer-label">{text.phoneLabel}</span>

                <a href={`tel:${businessSettings.phone}`}>
                  {businessSettings.phone}
                </a>
              </div>
            )}

            {businessSettings?.mobilePhone && (
              <div className="footer-contact-item">
                <span className="footer-label">{text.mobilePhoneLabel}</span>

                <a href={`tel:${businessSettings.mobilePhone}`}>
                  {businessSettings.mobilePhone}
                </a>
              </div>
            )}

            {addressLines.length > 0 && (
              <div className="footer-contact-item">
                <span className="footer-label">{text.addressLabel}</span>

                <address>
                  {addressLines.map((line, index) => (
                    <span key={`${index}-${line}`}>
                      {line}
                      {index < addressLines.length - 1 && <br />}
                    </span>
                  ))}
                </address>
              </div>
            )}
            {locationUrl && (
              <div className="footer-contact-item">
                <a
                  className="footer-map-link"
                  href={locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${text.mapLink} (${text.opensInNewTab})`}
                >
                  {text.mapLink}

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M15 3h6v6M10 14 21 3" />
                    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <div className="footer-column" id="reservas">
            <h2>{text.reservationsTitle}</h2>

            <div className="footer-contact-item">
              <span className="footer-label">{text.hoursLabel}</span>

              <div>
                {text.hours.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>

            {/* <p className="footer-reservation-text">
              {text.reservationText}
            </p>

            <a
              className="footer-reservation-button"
              href={reservationEmail}
            >
              {text.reservationButton}
            </a> */}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © {currentYear} Restaurante Caldo Verde. {text.rightsReserved}
          </p>

          <Link href="/politica-de-privacidade">{text.privacyPolicy}</Link>
        </div>
      </div>
    </footer>
  );
}
