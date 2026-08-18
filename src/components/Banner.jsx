export default function Banner() {
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
          Bem-vindo ao Restaurante Caldo Verde
        </p>

        <h1>
          Encontre o melhor sabor da cozinha portuguesa
        </h1>

        <a className="hero-button" href="#restaurante">
          Descobrir mais
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}