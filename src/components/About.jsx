export default function About() {
  return (
    <section className="about-section" id="restaurante">
      <div className="about-container">
        <div className="about-content">
          <p className="about-subtitle">
            O Restaurante
          </p>

          <h2>
            Uma viagem pelos sabores de Portugal
          </h2>

          <p className="about-description">
            No Caldo Verde celebramos a cozinha portuguesa através de
            receitas tradicionais, ingredientes cuidadosamente selecionados
            e sabores que nos fazem recordar Portugal.
          </p>

          <ul className="about-features">
            <li>Receitas tradicionais</li>
            <li>Produtos selecionados</li>
            <li>Sabores portugueses</li>
            <li>Ambiente acolhedor</li>
          </ul>

          <a className="about-button" href="#ementa">
            Conhecer a ementa
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="about-images">
          <img
            className="about-image-main"
            src="/assets/images/bg/h3-intro-big.png"
            alt="Apresentação do Restaurante Caldo Verde"
          />

          <img
            className="about-image-secondary"
            src="/assets/images/bg/h3-intro-sm.png"
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}