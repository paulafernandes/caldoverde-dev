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

          {menuCategories.length === 0 ? (
            <p>A ementa ainda não tem categorias.</p>
          ) : (
            <div className={styles.accordionList}>
              {menuCategories.map((category) => {
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
                            {category.items.map((item) => {
                              const isEditing =
                                editingItemId === item.id;

                              const editorId =
                                `item-editor-${item.id}`;

                              return (
                                <Fragment key={item.id}>
                                  <article className={styles.dishRow}>
                                    <span className={styles.dishOrder}>
                                      {item.position}
                                    </span>

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