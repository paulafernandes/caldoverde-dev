import { useState } from "react";
import menuCategories from "../data/menuCategories";

export default function Menu() {
  const [activeCategoryId, setActiveCategoryId] = useState(
    menuCategories[0].id
  );

  const activeCategory = menuCategories.find(
    (category) => category.id === activeCategoryId
  );

  return (
    <section className="menu-section" id="ementa">
      <div className="menu-container">
        <div className="menu-heading">
          <p className="menu-subtitle">A nossa ementa</p>
          <h2>Descubra os sabores de Portugal</h2>
        </div>

        <div
          className="menu-tabs"
          role="tablist"
          aria-label="Categorias da ementa"
        >
          {menuCategories.map((category) => {
            const isActive = category.id === activeCategoryId;

            return (
              <button
                key={category.id}
                id={`tab-${category.id}`}
                type="button"
                role="tab"
                className={`menu-tab-button ${
                  isActive ? "is-active" : ""
                }`}
                aria-selected={isActive}
                aria-controls={`panel-${category.id}`}
                onClick={() => setActiveCategoryId(category.id)}
              >
                {category.label}
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
            <img
              src={activeCategory.image}
              alt=""
              aria-hidden="true"
            />

            <div className="menu-panel-image-overlay">
              <span>A nossa seleção</span>
              <h3>{activeCategory.title}</h3>
            </div>
          </div>

          <div className="menu-list">
            <h3>{activeCategory.title}</h3>

            <ul>
              {activeCategory.items.map((item) => (
                <li key={item.id} className="menu-dish">
                  <div className="menu-dish-heading">
                    <h4>{item.name}</h4>

                    <span
                      className="menu-dish-separator"
                      aria-hidden="true"
                    />

                    <span className="menu-dish-price">
                      {item.price}
                    </span>
                  </div>

                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}