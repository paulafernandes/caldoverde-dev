import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";
import Image from "next/image";

const priceLocales = {
  pt: "pt-PT",
  es: "es-ES",
  en: "en-GB",
};

export default function Menu({ menuCategories = [] }) {
  const menuListRef = useRef(null);
  const tabRefs = useRef([]);

  const [activeCategoryId, setActiveCategoryId] = useState(
    menuCategories[0]?.id ?? null
  );

  const { language } = useLanguage();
  const text = translations[language].menu;

  const activeCategory =
    menuCategories.find((category) => category.id === activeCategoryId) ??
    menuCategories[0] ??
    null;

  function handleTabKeyDown(event, index) {
    let nextIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % menuCategories.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + menuCategories.length) % menuCategories.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = menuCategories.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
  }

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 900px)").matches;

    if (!isMobile) {
      return;
    }

    requestAnimationFrame(() => {
      menuListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [activeCategoryId]);

  return (
    <section className="menu-group" id="ementa">
      <div className="menu-container">
        <div className="menu-heading">
          <p className="menu-subtitle">{text.subtitle}</p>

          <h2>{text.title}</h2>
        </div>

        {activeCategory && (
          <>
            <div
              className="menu-tabs"
              role="tablist"
              aria-label={text.categoriesLabel}
            >
              {menuCategories.map((category, index) => {
                const isActive = category.id === activeCategory.id;

                return (
                  <button
                    key={category.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    id={`tab-${category.id}`}
                    type="button"
                    role="tab"
                    className={`menu-tab-button ${isActive ? "is-active" : ""}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${category.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    onClick={() => setActiveCategoryId(category.id)}
                  >
                    {category.label[language]}
                  </button>
                );
              })}
            </div>

            <div
              className="menu-panel"
              id={`panel-${activeCategory.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeCategory.id}`}
              tabIndex={0}
            >
              <div className="menu-panel-image">
                <Image
                  src={activeCategory.image}
                  alt={activeCategory.title[language]}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  unoptimized={activeCategory.image.startsWith("/uploads/")}
                />
              </div>
              <div className="menu-list" ref={menuListRef}>
                {activeCategory.highlightText?.[language] && (
                  <div className="menu-highlight">
                    {activeCategory.highlightText[language]}
                  </div>
                )}
                {activeCategory.sections.map((section) => (
                  <div className="menu-group" key={section.id}>
                    <h3>{section.title[language]}</h3>

                    <ul>
                      {section.items.map((item) => (
                        <li key={item.id} className="menu-dish">
                          <div className="menu-dish-heading">
                            <h4>{item.name[language]}</h4>

                            <span
                              className="menu-dish-separator"
                              aria-hidden="true"
                            />

                            <span className="menu-dish-price">
                              {item.price === null
                                ? text.pricePending
                                : item.price}
                            </span>
                          </div>

                          <p>{item.description[language]}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
