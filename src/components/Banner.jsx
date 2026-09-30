import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";

export default function Banner() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { language } = useLanguage();
  const text = translations[language].banner;

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (!motionPreference.matches) {
      video.play().catch(() => {
        // Se a reprodução automática for bloqueada, fica disponível o botão.
      });
    }

    function handleMotionChange(event) {
      if (event.matches) {
        video.pause();
      }
    }

    motionPreference.addEventListener("change", handleMotionChange);

    return () => {
      motionPreference.removeEventListener("change", handleMotionChange);
      video.pause();
    };
  }, []);

  function toggleVideo() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play().catch(() => {
        setIsPlaying(!video.paused);
      });
    } else {
      video.pause();
    }
  }

  return (
    <section className="hero-banner" id="inicio">
      <video
        ref={videoRef}
        id="hero-background-video"
        className="hero-video"
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/assets/video/slow_mo.mp4" type="video/mp4" />
      </video>

      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="hero-subtitle">{text.subtitle}</p>

        <h1>{text.title}</h1>

        <a className="hero-button" href="#restaurante">
          {text.button}
          <span aria-hidden="true">↗</span>
        </a>

        <button
          type="button"
          className="hero-video-control"
          aria-controls="hero-background-video"
          onClick={toggleVideo}
        >
          {isPlaying ? text.pauseVideo : text.playVideo}
        </button>
      </div>
    </section>
  );
}
