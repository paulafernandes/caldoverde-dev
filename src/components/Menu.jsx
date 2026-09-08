import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";
import Image from "next/image";

const priceLocales = {
  pt: "pt-PT",
  es: "es-ES",
  en: "en-GB",
};

export default function Menu({
  menuCategories = [],
}) {
  const [activeCategoryId, setActiveCategoryId] =
    useState(menuCategories[0]?.id ?? null);

  const { language } = useLanguage();
  const text = translations[language].menu;

  const activeCategory =
    menuCategories.find(
      (category) => category.id === activeCategoryId
    ) ??
    menuCategories[0] ??
    null;

  return (
    <section className="menu-group" id="ementa">
      <div className="menu-container">
        <div className="menu-heading">
          <p className="menu-subtitle">
            {text.subtitle}
          </p>

          <h2>{text.title}</h2>
        </div>

        {activeCategory && (
          <>
            <div
              className="menu-tabs"
              role="tablist"
              aria-label={text.categoriesLabel}
            >
              {menuCategories.map((category) => {
                const isActive =
                  category.id === activeCategory.id;

                return (
                  <button
                    key={category.id}
                    id={`tab-${category.id}`}
                    type="button"
                    role="tab"
                    className={`menu-tab-button ${isActive ? "is-active" : ""
                      }`}
                    aria-selected={isActive}
                    aria-controls={`panel-${category.id}`}
                    onClick={() =>
                      setActiveCategoryId(category.id)
                    }
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
            >
              <div className="menu-panel-image">
                <Image
                  src={activeCategory.image}
                  alt={activeCategory.title[language]}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  unoptimized={activeCategory.image.startsWith(
                    "/uploads/"
                  )}
                />
              </div>

              <div className="menu-list">
                <div className="menu-list">
                  {activeCategory.sections.map((section) => (
                    <div
                      className="menu-group"
                      key={section.id}
                    >
                      <h3>
                        {section.title[language]}
                      </h3>

                      <ul>
                        {section.items.map((item) => (
                          <li
                            key={item.id}
                            className="menu-dish"
                          >
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

                            <p>
                              {item.description[language]}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}