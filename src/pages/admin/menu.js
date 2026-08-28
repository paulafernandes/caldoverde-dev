import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";

import { authClient } from "../../lib/authClient";
import { getAdminMenuCategories } from "../../server/adminMenuService";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";
import MenuItemEditor from "../../components/admin/MenuItemEditor";
import MenuCategoryEditor from "../../components/admin/MenuCategoryEditor";

const languages = ["pt", "es", "en"];

const priceFormatter = new Intl.NumberFormat(
  "pt-PT",
  {
    style: "currency",
    currency: "EUR",
  }
);

function formatPrice(priceCents) {
  if (priceCents === null) {
    return "Pendente";
  }

  return priceFormatter.format(priceCents / 100);
}

export default function AdminMenuPage({
  admin,
  menuCategories,
}) {
  const router = useRouter();

  const [expandedCategoryId, setExpandedCategoryId] =
    useState(menuCategories[0]?.id ?? null);

  const [editingItemId, setEditingItemId] =
    useState(null);

  const [
    editingCategoryId,
    setEditingCategoryId,
  ] = useState(null);

  const [
    creatingItemCategoryId,
    setCreatingItemCategoryId,
  ] = useState(null);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const totalItems = menuCategories.reduce(
    (total, category) =>
      total + category.items.length,
    0
  );

  const hasOpenEditor =
    editingItemId !== null ||
    editingCategoryId !== null ||
    creatingItemCategoryId !== null;

  const [movingItemId, setMovingItemId] =
    useState(null);

  const [
    movingCategoryId,
    setMovingCategoryId,
  ] = useState(null);

  const [actionError, setActionError] =
    useState("");

  function toggleCategory(categoryId) {
    setCreatingItemCategoryId(null);
    setEditingCategoryId(null);
    setEditingItemId(null);
    setSaveMessage("");

    setExpandedCategoryId((currentId) =>
      currentId === categoryId
        ? null
        : categoryId
    );
  }

  function toggleItemEditor(itemId) {
    setCreatingItemCategoryId(null);
    setEditingCategoryId(null);
    setSaveMessage("");

    setEditingItemId((currentId) =>
      currentId === itemId ? null : itemId
    );
  }

  function toggleItemCreator(categoryId) {
    setEditingItemId(null);
    setEditingCategoryId(null);
    setSaveMessage("");

    setCreatingItemCategoryId((currentId) =>
      currentId === categoryId
        ? null
        : categoryId
    );
  }

  async function handleItemCreated(categoryId) {
    setCreatingItemCategoryId(null);
    setEditingItemId(null);
    setEditingCategoryId(null);
    setExpandedCategoryId(categoryId);

    await router.replace(
      router.asPath,
      undefined,
      {
        scroll: false,
      }
    );

    setSaveMessage(
      "O novo prato foi criado com sucesso."
    );
  }

  function toggleCategoryEditor(categoryId) {
    setCreatingItemCategoryId(null);
    setEditingItemId(null);
    setSaveMessage("");

    setEditingCategoryId((currentId) =>
      currentId === categoryId
        ? null
        : categoryId
    );
  }

  async function handleCategorySaved(categoryId) {
    setCreatingItemCategoryId(null);
    setEditingCategoryId(null);
    setEditingItemId(null);
    setExpandedCategoryId(categoryId);

    await router.replace(
      router.asPath,
      undefined,
      {
        scroll: false,
      }
    );

    setSaveMessage(
      "A categoria foi atualizada com sucesso."
    );
  }

  async function handleItemSaved(categoryId) {
    setEditingItemId(null);
    setEditingCategoryId(null);
    setCreatingItemCategoryId(null);
    setExpandedCategoryId(categoryId);

    await router.replace(
      router.asPath,
      undefined,
      {
        scroll: false,
      }
    );

    setSaveMessage(
      "O prato foi atualizado com sucesso."
    );
  }

  async function handleItemDeleted(categoryId) {
    setEditingItemId(null);
    setEditingCategoryId(null);
    setCreatingItemCategoryId(null);
    setExpandedCategoryId(categoryId);

    await router.replace(
      router.asPath,
      undefined,
      {
        scroll: false,
      }
    );

    setSaveMessage(
      "O prato foi eliminado com sucesso."
    );
  }

  async function handleMoveItem(
    itemId,
    direction,
    categoryId
  ) {
    setActionError("");
    setSaveMessage("");
    setMovingItemId(itemId);

    try {
      const response = await fetch(
        "/api/admin/menu/items/order",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            itemId,
            direction,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setActionError(
          result.error ??
          "Não foi possível alterar a ordem."
        );
        return;
      }

      if (!result.moved) {
        return;
      }

      setExpandedCategoryId(categoryId);

      await router.replace(
        router.asPath,
        undefined,
        {
          scroll: false,
        }
      );

    } catch {
      setActionError(
        "Não foi possível comunicar com o servidor."
      );
    } finally {
      setMovingItemId(null);
    }
  }

  async function handleMoveCategory(
    categoryId,
    direction
  ) {
    setActionError("");
    setSaveMessage("");
    setMovingCategoryId(categoryId);

    try {
      const response = await fetch(
        "/api/admin/menu/categories/order",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            categoryId,
            direction,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setActionError(
          result.error ??
          "Não foi possível alterar a ordem."
        );
        return;
      }

      if (!result.moved) {
        return;
      }

      setExpandedCategoryId(categoryId);

      await router.replace(
        router.asPath,
        undefined,
        {
          scroll: false,
        }
      );
    } catch {
      setActionError(
        "Não foi possível comunicar com o servidor."
      );
    } finally {
      setMovingCategoryId(null);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    await router.replace("/admin/login");
  }

  return (
    <>
      <Head>
        <title>Ementa | Administração</title>

        <meta
          name="robots"
          content="noindex, nofollow"
        />
      </Head>

      <main className={styles.adminDashboard}>
        <div className={styles.adminShell}>
          <header className={styles.topbar}>
            <div className={styles.brand}>
              <span
                className={styles.brandMark}
                aria-hidden="true"
              >
                CV
              </span>

              <div className={styles.brandText}>
                <strong>
                  Caldo Verde · Administração
                </strong>

                <span>{admin.email}</span>
              </div>
            </div>

            <button
              className={styles.logoutButton}
              type="button"
              disabled={isSigningOut}
              onClick={handleSignOut}
            >
              {isSigningOut
                ? "A sair..."
                : "Terminar sessão"}
            </button>
          </header>

          <section className={styles.dashboardHeading}>
            <div>
              <h1>Gestão da ementa</h1>

              <p>
                Categorias, traduções, pratos e preços.
              </p>
            </div>

            <div
              className={styles.statList}
              aria-label="Resumo da ementa"
            >
              <span className={styles.stat}>
                <strong>{menuCategories.length}</strong>{" "}
                categorias
              </span>

              <span className={styles.stat}>
                <strong>{totalItems}</strong> pratos
              </span>
            </div>
          </section>

          {saveMessage && (
            <p
              className={styles.successMessage}
              role="status"
            >
              {saveMessage}
            </p>
          )}

          {actionError && (
            <p
              className={styles.pageErrorMessage}
              role="alert"
            >
              {actionError}
            </p>
          )}

          {menuCategories.length === 0 ? (
            <p>A ementa ainda não tem categorias.</p>
          ) : (
            <div className={styles.accordionList}>
              {menuCategories.map(
                (category, categoryIndex) => {
                  const isExpanded =
                    category.id === expandedCategoryId;

                  const isEditingCategory =
                    editingCategoryId === category.id;

                  const categoryEditorId =
                    `category-editor-${category.id}`;

                  const buttonId =
                    `category-button-${category.id}`;

                  const panelId =
                    `category-panel-${category.id}`;

                  const isCreatingItem =
                    creatingItemCategoryId === category.id;

                  const itemCreatorId =
                    `item-creator-${category.id}`;

                  return (
                    <section
                      className={styles.accordion}
                      key={category.id}
                    >
                      <div className={styles.categoryHeaderRow}>
                        <div
                          className={
                            styles.categoryOrderControls
                          }
                          aria-label={`Alterar ordem de ${category.translations.pt.label ||
                            category.slug
                            }`}
                        >
                          <button
                            className={styles.orderButton}
                            type="button"
                            title="Mover categoria para cima"
                            aria-label="Mover categoria para cima"
                            disabled={
                              categoryIndex === 0 ||
                              movingCategoryId !== null ||
                              movingItemId !== null ||
                              hasOpenEditor
                            }
                            onClick={() =>
                              handleMoveCategory(
                                category.id,
                                "up"
                              )
                            }
                          >
                            ↑
                          </button>

                          <span
                            className={styles.categoryPosition}
                          >
                            {category.position}
                          </span>

                          <button
                            className={styles.orderButton}
                            type="button"
                            title="Mover categoria para baixo"
                            aria-label="Mover categoria para baixo"
                            disabled={
                              categoryIndex ===
                              menuCategories.length - 1 ||
                              movingCategoryId !== null ||
                              movingItemId !== null ||
                              hasOpenEditor
                            }
                            onClick={() =>
                              handleMoveCategory(
                                category.id,
                                "down"
                              )
                            }
                          >
                            ↓
                          </button>
                        </div>

                        <button
                          className={styles.accordionButton}
                          id={buttonId}
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          onClick={() =>
                            toggleCategory(category.id)
                          }
                        >
                          <span
                            className={styles.categoryIdentity}
                          >
                            <strong>
                              {category.translations.pt.label ||
                                category.slug}
                            </strong>

                            <span>
                              {category.slug} ·{" "}
                              {category.items.length} pratos
                            </span>
                          </span>

                          <span
                            className={
                              category.isVisible
                                ? styles.statusVisible
                                : styles.statusHidden
                            }
                          >
                            {category.isVisible
                              ? "Visível"
                              : "Oculta"}
                          </span>

                          <span
                            className={styles.chevron}
                            aria-hidden="true"
                          >
                            ⌄
                          </span>
                        </button>
                      </div>
                      {isExpanded && (
                        <div
                          className={styles.accordionBody}
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                        >
                          <div
                            className={
                              styles.categoryDetails
                            }
                          >
                            <div
                              className={
                                styles.translationList
                              }
                            >
                              {languages.map((language) => (
                                <span key={language}>
                                  <strong>
                                    {language.toUpperCase()}
                                  </strong>{" "}
                                  {
                                    category.translations[
                                      language
                                    ].label
                                  }
                                </span>
                              ))}
                            </div>

                            <p className={styles.imagePath}>
                              <strong>Imagem:</strong>{" "}
                              {category.imagePath ??
                                "Sem imagem"}
                            </p>
                            <div className={styles.categoryActions}>
                              <button
                                className={styles.addButton}
                                type="button"
                                aria-expanded={isCreatingItem}
                                aria-controls={itemCreatorId}
                                onClick={() =>
                                  toggleItemCreator(category.id)
                                }
                              >
                                {isCreatingItem
                                  ? "Fechar novo prato"
                                  : "Adicionar prato"}
                              </button>
                              <button
                                className={styles.editButton}
                                type="button"
                                aria-expanded={isEditingCategory}
                                aria-controls={categoryEditorId}
                                onClick={() =>
                                  toggleCategoryEditor(category.id)
                                }
                              >
                                {isEditingCategory
                                  ? "Fechar edição"
                                  : "Editar categoria"}
                              </button>
                            </div>
                          </div>
                          {isEditingCategory && (
                            <div
                              className={
                                styles.categoryEditorWrapper
                              }
                              id={categoryEditorId}
                            >
                              <MenuCategoryEditor
                                category={category}
                                onCancel={() =>
                                  setEditingCategoryId(null)
                                }
                                onSaved={() =>
                                  handleCategorySaved(category.id)
                                }
                              />
                            </div>
                          )}
                          {isCreatingItem && (
                            <div
                              className={
                                styles.categoryEditorWrapper
                              }
                              id={itemCreatorId}
                            >
                              <MenuItemEditor
                                item={null}
                                categoryId={category.id}
                                onCancel={() =>
                                  setCreatingItemCategoryId(null)
                                }
                                onSaved={() =>
                                  handleItemCreated(category.id)
                                }
                              />
                            </div>
                          )}
                          {category.items.length === 0 ? (
                            <p>
                              Esta categoria ainda não tem
                              pratos.
                            </p>
                          ) : (
                            <div className={styles.dishList}>
                              {category.items.map((item, itemIndex) => {
                                const isEditing =
                                  editingItemId === item.id;

                                const editorId =
                                  `item-editor-${item.id}`;

                                return (
                                  <Fragment key={item.id}>
                                    <article className={styles.dishRow}>
                                      <div
                                        className={styles.orderControls}
                                        aria-label={`Alterar ordem de ${item.translations.pt.name}`}
                                      >
                                        <button
                                          className={styles.orderButton}
                                          type="button"
                                          title="Mover para cima"
                                          aria-label={`Mover ${item.translations.pt.name} para cima`}
                                          disabled={
                                            itemIndex === 0 ||
                                            movingItemId !== null ||
                                            hasOpenEditor
                                          }
                                          onClick={() =>
                                            handleMoveItem(
                                              item.id,
                                              "up",
                                              category.id
                                            )
                                          }
                                        >
                                          ↑
                                        </button>

                                        <span className={styles.dishOrder}>
                                          {item.position}
                                        </span>

                                        <button
                                          className={styles.orderButton}
                                          type="button"
                                          title="Mover para baixo"
                                          aria-label={`Mover ${item.translations.pt.name} para baixo`}
                                          disabled={
                                            itemIndex ===
                                            category.items.length - 1 ||
                                            movingItemId !== null ||
                                            hasOpenEditor
                                          }
                                          onClick={() =>
                                            handleMoveItem(
                                              item.id,
                                              "down",
                                              category.id
                                            )
                                          }
                                        >
                                          ↓
                                        </button>
                                      </div>
                                      <div className={styles.dishPrimary}>
                                        <strong>
                                          {item.translations.pt.name}
                                        </strong>

                                        <span>
                                          {item.translations.pt.description}
                                        </span>
                                      </div>

                                      <div className={styles.dishAlternate}>
                                        <div>
                                          <strong>
                                            ES · {item.translations.es.name}
                                          </strong>

                                          <span>
                                            {
                                              item.translations.es
                                                .description
                                            }
                                          </span>
                                        </div>

                                        <div>
                                          <strong>
                                            EN · {item.translations.en.name}
                                          </strong>

                                          <span>
                                            {
                                              item.translations.en
                                                .description
                                            }
                                          </span>
                                        </div>
                                      </div>

                                      <span className={styles.dishPrice}>
                                        {formatPrice(item.priceCents)}
                                      </span>

                                      <span
                                        className={
                                          item.isVisible
                                            ? styles.statusVisible
                                            : styles.statusHidden
                                        }
                                      >
                                        {item.isVisible
                                          ? "Visível"
                                          : "Oculto"}
                                      </span>

                                      <button
                                        className={styles.editButton}
                                        type="button"
                                        aria-expanded={isEditing}
                                        aria-controls={editorId}
                                        onClick={() =>
                                          toggleItemEditor(item.id)
                                        }
                                      >
                                        {isEditing ? "Fechar" : "Editar"}
                                      </button>
                                    </article>

                                    {isEditing && (
                                      <div
                                        className={styles.editorWrapper}
                                        id={editorId}
                                      >
                                        <MenuItemEditor
                                          item={item}
                                          onCancel={() =>
                                            setEditingItemId(null)
                                          }
                                          onSaved={() =>
                                            handleItemSaved(category.id)
                                          }
                                          onDeleted={() =>
                                            handleItemDeleted(category.id)
                                          }
                                        />
                                      </div>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getAdminSession(req);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  const menuCategories =
    await getAdminMenuCategories();

  return {
    props: {
      admin: {
        name: session.user.name,
        email: session.user.email,
      },
      menuCategories,
    },
  };
}