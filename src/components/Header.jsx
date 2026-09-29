import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";
import { useRouter } from "next/router";
import Image from "next/image";

const languageOptions = [
  {
    code: "pt",
    flag: "🇵🇹",
    label: "Português",
  },
  {
    code: "es",
    flag: "🇪🇸",
    label: "Español",
  },
  {
    code: "en",
    flag: "🇬🇧",
    label: "English",
  },
];

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { language, changeLanguage } = useLanguage();
  const text = translations[language].header;
  const imageText = translations[language].images;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function selectLanguage(languageCode) {
    changeLanguage(languageCode);
    closeMenu();

    const currentHash = window.location.hash;

    const destination =
      router.pathname === "/[lang]/about"
        ? `/${languageCode}/about${currentHash}`
        : `/${languageCode}/${currentHash}`;

    router.push(destination, undefined, {
      scroll: false,
    });
  }

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-container">
          <p>{text.welcome}</p>

          <div className="top-bar-contact">
            <a href="mailto:info@caldoverde.es">info@caldoverde.es</a>

            <span>{text.address}</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="header-container">
          <Link
            href={`/${language}/`}
            className="header-logo"
            onClick={closeMenu}
          >
            <Image
              src="/assets/images/logo_andorinha.png"
              alt={imageText.logo}
              width={280}
              height={100}
            />
          </Link>

          <button
            type="button"
            className={`mobile-menu-button ${isMenuOpen ? "is-active" : ""}`}
            aria-label={isMenuOpen ? text.closeMenu : text.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMenuOpen((previousValue) => !previousValue)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id="main-navigation"
            className={`main-navigation ${isMenuOpen ? "is-open" : ""}`}
            aria-label={text.mainNavigation}
          >
            <a
              className="is-active"
              href={`/${language}/#inicio`}
              onClick={closeMenu}
            >
              {text.home}
            </a>

            <a href={`/${language}/#restaurante`} onClick={closeMenu}>
              {text.about}
            </a>

            <Link href={`/${language}/about`} onClick={closeMenu}>
              {text.aboutUs}
            </Link>

            <a href={`/${language}/#ementa`} onClick={closeMenu}>
              {text.menu}
            </a>

            <a href={`/${language}/#contactos`} onClick={closeMenu}>
              {text.contact}
            </a>
            <div
              className="language-switcher"
              role="group"
              aria-label={text.languageLabel}
            >
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={`language-button ${
                    language === option.code ? "is-active" : ""
                  }`}
                  aria-label={option.label}
                  aria-pressed={language === option.code}
                  title={option.label}
                  onClick={() => selectLanguage(option.code)}
                >
                  <span aria-hidden="true">{option.flag}</span>
                </button>
              ))}
            </div>

            {/* <a
              className="mobile-reservation-link"
              href="#reservas"
              onClick={closeMenu}
            >
              {text.reservation}
            </a> */}
          </nav>

          {/* <a className="reservation-button" href="#reservas">
            {text.reservation}
          </a> */}
        </div>
      </header>
    </>
  );
}
