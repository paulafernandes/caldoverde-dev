import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contactos">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <img
                src="/assets/images/logo_completo.png"
                alt="Restaurante Caldo Verde"
              />
            </Link>

            <p>
              Cozinha portuguesa preparada com respeito pela tradição,
              pelos ingredientes e pelos sabores de Portugal.
            </p>
          </div>

          <div className="footer-column">
            <h2>Contactos</h2>

            <div className="footer-contact-item">
              <span className="footer-label">Email</span>

              <a href="mailto:info@caldoverde.es">
                info@caldoverde.es
              </a>
            </div>

            <div className="footer-contact-item">
              <span className="footer-label">Telefone</span>
              <span>Telefone a colocar</span>
            </div>

            <div className="footer-contact-item">
              <span className="footer-label">Morada</span>
              <address>Morada a colocar</address>
            </div>
          </div>

          <div className="footer-column" id="reservas">
            <h2>Horário e reservas</h2>

            <div className="footer-contact-item">
              <span className="footer-label">Horário</span>
              <span>Horário a colocar</span>
            </div>

            <p className="footer-reservation-text">
              Para informações ou pedidos de reserva, contacte-nos por
              email.
            </p>

            <a
              className="footer-reservation-button"
              href="mailto:info@caldoverde.es?subject=Pedido%20de%20reserva"
            >
              Pedir uma reserva
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © {currentYear} Restaurante Caldo Verde. Todos os direitos
            reservados.
          </p>

          <a href="/politica-de-privacidade">
            Política de privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}