import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-container">
          <p>Bem-vindo ao Restaurante Caldo Verde!</p>

          <div className="top-bar-contact">
            <a href="mailto:info@caldoverde.es">
              info@caldoverde.es
            </a>

            <span>Morada a colocar</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="header-container">
          <Link href="/" className="header-logo" onClick={closeMenu}>
            <img
              src="/assets/images/logo_completo.png"
              alt="Restaurante Caldo Verde"
            />
          </Link>

          <button
            type="button"
            className={`mobile-menu-button ${
              isMenuOpen ? "is-active" : ""
            }`}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
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
            className={`main-navigation ${
              isMenuOpen ? "is-open" : ""
            }`}
            aria-label="Navegação principal"
          >
            <a href="#inicio" onClick={closeMenu}>
              Início
            </a>

            <a href="#restaurante" onClick={closeMenu}>
              O Restaurante
            </a>

            <a href="#ementa" onClick={closeMenu}>
              Ementa
            </a>

            <a href="#contactos" onClick={closeMenu}>
              Contactos
            </a>

            <a
              className="mobile-reservation-link"
              href="#reservas"
              onClick={closeMenu}
            >
              Reservar
            </a>
          </nav>

          <a className="reservation-button" href="#reservas">
            Reservar
          </a>
        </div>
      </header>
    </>
  );
}