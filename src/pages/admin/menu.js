import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

import { authClient } from "../../lib/authClient";
import { getAdminMenuCategories } from "../../server/adminMenuService";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";
import MenuItemEditor from "../../components/admin/MenuItemEditor";
import MenuCategoryEditor from "../../components/admin/MenuCategoryEditor";
import Image from "next/image";
import { adminFetch } from "../../lib/adminFetch";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminLanguage } from "../../context/AdminLanguageContext";

const languages = ["pt", "es", "en"];

export default function AdminMenuPage({ admin, menuCategories }) {
  const { language, t } = useAdminLanguage();
  const router = useRouter();
  const [expandedCategoryId, setExpandedCategoryId] = useState(
    menuCategories[0]?.id ?? null
  );
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [creatingSubcategoryCategoryId, setCreatingSubcategoryCategoryId] =
    useState(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [creatingItem, setCreatingItem] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageVariables, setSaveMessageVariables] = useState({});
  const [saveMessageCategoryId, setSaveMessageCategoryId] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [reauthEmail, setReauthEmail] = useState(admin.email);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [showReauthForm, setShowReauthForm] = useState(false);
  const totalItems = menuCategories.reduce(
    (total, category) => total + category.items.length,
    0
  );
  const [movingItemId, setMovingItemId] = useState(null);
  const [movingCategoryId, setMovingCategoryId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] =
    useState(null);
  const [movingSubcategoryId, setMovingSubcategoryId] = useState(null);
  const [newCategoryDraft, setNewCategoryDraft] = useState(null);
  const hasOpenEditor =
    isCreatingCategory ||
    editingItemId !== null ||
    editingCategoryId !== null ||
    creatingItem !== null ||
    creatingSubcategoryCategoryId !== null ||
    editingSubcategoryId !== null;

  const [newItemDraft, setNewItemDraft] = useState(null);

  useEffect(() => {
    function handleSessionExpired() {
      setIsSessionExpired(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener("admin-session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("admin-session-expired", handleSessionExpired);
    };
  }, []);

  function toggleCategory(categoryId) {
    setIsCreatingCategory(false);
    setCreatingItem(null);
    setEditingCategoryId(null);
    setEditingItemId(null);
    setSaveMessage("");
    setCreatingSubcategoryCategoryId(null);

    setExpandedCategoryId((currentId) =>
      currentId === categoryId ? null : categoryId
    );
  }

  function scrollEditorIntoView(editorId) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(editorId)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    });
  }

  function scrollToGlobalSuccess() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById("menu-global-success")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  function scrollToCategorySuccess(categoryId) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById(`category-success-${categoryId}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      });
    });
  }

  function toggleItemEditor(itemId, editorId) {
    setIsCreatingCategory(false);
    setCreatingItem(null);
    setEditingCategoryId(null);
    setSaveMessage("");
    setCreatingSubcategoryCategoryId(null);
    setEditingSubcategoryId(null);

    setEditingItemId((currentId) => {
      const isClosing = currentId === itemId;

      if (!isClosing) {
        scrollEditorIntoView(editorId);
      }

      return isClosing ? null : itemId;
    });
  }

  function toggleItemCreator(categoryId, subcategoryId = null) {
    setIsCreatingCategory(false);
    setEditingItemId(null);
    setEditingCategoryId(null);
    setSaveMessage("");
    setCreatingSubcategoryCategoryId(null);
    setEditingSubcategoryId(null);

    setCreatingItem((currentItem) => {
      if (
        currentItem?.categoryId === categoryId &&
        currentItem?.subcategoryId === subcategoryId
      ) {
        return null;
      }

      return {
        categoryId,
        subcategoryId,
      };
    });
  }

  function showSaveMessage(key, variables = {}, categoryId = null) {
    setSaveMessage(key);
    setSaveMessageVariables(variables);
    setSaveMessageCategoryId(categoryId);
  }

  async function handleItemCreated(categoryId) {
    setNewItemDraft(null);
    setCreatingItem(null);
    setEditingItemId(null);
    setEditingCategoryId(null);
    setExpandedCategoryId(categoryId);

    await router.replace(router.asPath, undefined, {
      scroll: false,
    });

    showSaveMessage("menu.page.newItemCreated", {}, categoryId);

    scrollToCategorySuccess(categoryId);
  }

  function toggleCategoryEditor(categoryId, editorId) {
    setIsCreatingCategory(false);
    setCreatingItem(null);
    setEditingItemId(null);
    setSaveMessage("");
    setEditingSubcategoryId(null);

    setEditingCategoryId((currentId) => {
      const isClosing = currentId === categoryId;

      if (!isClosing) {
        scrollEditorIntoView(editorId);
      }

      return isClosing ? null : categoryId;
    });
  }

  async function handleCategorySaved(categoryId, categoryName) {
    setCreatingItem(null);
    setEditingCategoryId(null);
    setEditingItemId(null);
    setExpandedCategoryId(categoryId);

    await router.replace(router.asPath, undefined, {
      scroll: false,
    });

    showSaveMessage("menu.page.categoryUpdated", { name: categoryName });
    scrollToGlobalSuccess();
  }

  async function handleCategorySubcategoriesChanged(categoryId, message) {
    setExpandedCategoryId(categoryId);

    await router.replace(router.asPath, undefined, {
      scroll: false,
    });

    showSaveMessage(message);
  }

  async function handleItemSaved(categoryId, itemName) {
    setEditingItemId(null);
    setEditingCategoryId(null);
    setCreatingItem(null);
    setExpandedCategoryId(categoryId);

    await router.replace(router.asPath, undefined, {
      scroll: false,
    });

    showSaveMessage("menu.page.itemUpdated", { name: itemName }, categoryId);

    scrollToCategorySuccess(categoryId);
  }

  async function handleItemDeleted(categoryId, itemName) {
    setEditingItemId(null);
    setEditingCategoryId(null);
    setCreatingItem(null);
    setExpandedCategoryId(categoryId);

    await router.replace(router.asPath, undefined, {
      scroll: false,
    });

    showSaveMessage("menu.page.itemDeleted", { name: itemName }, categoryId);
    scrollToCategorySuccess(categoryId);
  }

  async function handleMoveItem(itemId, direction, categoryId) {
    setActionError("");
    setSaveMessage("");
    setMovingItemId(itemId);

    try {
      const response = await adminFetch("/api/admin/menu/items/order", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          itemId,
          direction,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setActionError("menu.page.itemOrderFailed");
        return;
      }

      if (!result.moved) {
        return;
      }

      setExpandedCategoryId(categoryId);

      await router.replace(router.asPath, undefined, {
        scroll: false,
      });
    } catch {
      setActionError("menu.common.serverError");
    } finally {
      setMovingItemId(null);
    }
  }

  async function handleMoveCategory(categoryId, direction) {
    setActionError("");
    setSaveMessage("");
    setMovingCategoryId(categoryId);

    try {
      const response = await adminFetch("/api/admin/menu/categories/order", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          categoryId,
          direction,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setActionError("menu.page.categoryOrderFailed");
        return;
      }

      if (!result.moved) {
        return;
      }

      setExpandedCategoryId(categoryId);

      await router.replace(router.asPath, undefined, {
        scroll: false,
      });
    } catch {
      setActionError("menu.common.serverError");
    } finally {
      setMovingCategoryId(null);
    }
  }

  async function handleCategoryDeleted(categoryName) {
    setIsCreatingCategory(false);
    setEditingCategoryId(null);
    setEditingItemId(null);
    setCreatingItem(null);
    setExpandedCategoryId(null);

    await router.replace(router.asPath, undefined, {
      scroll: false,
    });

    showSaveMessage("menu.page.categoryDeleted", { name: categoryName });
    scrollToGlobalSuccess();
  }

  async function handleReauthenticate(event) {
    event.preventDefault();

    setReauthError("");
    if (!reauthEmail.trim()) {
      setReauthError("validation.emailRequired");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(reauthEmail.trim())) {
      setReauthError("validation.emailInvalid");
      return;
    }

    if (!reauthPassword) {
      setReauthError("validation.passwordRequired");
      return;
    }
    setIsReauthenticating(true);

    const { error } = await authClient.signIn.email({
      email: reauthEmail.trim(),
      password: reauthPassword,
    });

    if (error) {
      setReauthError("session.signInFailed");

      setIsReauthenticating(false);
      return;
    }

    setIsSessionExpired(false);
    setShowReauthForm(false);
    setReauthPassword("");
    setReauthError("");
    setIsReauthenticating(false);
  }

  function toggleCategoryCreator() {
    setEditingItemId(null);
    setEditingCategoryId(null);
    setCreatingItem(null);
    setSaveMessage("");
    setActionError("");
    setEditingSubcategoryId(null);

    setIsCreatingCategory((currentValue) => !currentValue);
  }

  async function handleCategoryCreated(category, options = {}) {
    setNewCategoryDraft(null);
    setIsCreatingCategory(false);
    setEditingItemId(null);
    setCreatingItem(null);
    setExpandedCategoryId(category.id);

    if (options.addSubcategory) {
      setEditingCategoryId(category.id);
      setNewSubcategoryCategoryId(category.id);
    } else {
      setEditingCategoryId(null);
      setNewSubcategoryCategoryId(null);
    }

    await router.replace(router.asPath, undefined, {
      scroll: false,
    });

    if (options.addSubcategory) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document
            .getElementById(`category-editor-${category.id}`)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        });
      });
    }

    showSaveMessage(
      options.addSubcategory
        ? "menu.page.categoryCreatedAddSubcategory"
        : "menu.page.categoryCreated"
    );
  }
  return (
    <>
      <Head>
        <title>{t("menu.page.pageTitle")}</title>

        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>{t("menu.page.title")}</h1>

            <p>{t("menu.page.subtitle")}</p>
          </div>

          <div
            className={styles.statList}
            aria-label={t("menu.page.summaryAria")}
          >
            <span className={styles.stat}>
              <strong>{menuCategories.length}</strong>{" "}
              {menuCategories.length === 1
                ? t("menu.page.categorySingular")
                : t("menu.page.categoryPlural")}
            </span>
            <span className={styles.stat}>
              <strong>{totalItems}</strong>{" "}
              {totalItems === 1
                ? t("menu.page.dishSingular")
                : t("menu.page.dishPlural")}
            </span>
          </div>
        </section>

        <div className={styles.menuActions}>
          <button
            className={styles.addCategoryButton}
            type="button"
            aria-expanded={isCreatingCategory}
            aria-controls="new-category-editor"
            onClick={toggleCategoryCreator}
          >
            {isCreatingCategory
              ? t("menu.page.closeNewCategory")
              : t("menu.page.addCategory")}
          </button>
        </div>
        {isSessionExpired && (
          <div className={styles.sessionExpiredNotice} role="alert">
            <strong>{t("session.expiredTitle")}</strong>

            <p>{t("session.expiredDescription")}</p>

            {!showReauthForm ? (
              <button
                className={styles.saveButton}
                type="button"
                onClick={() => setShowReauthForm(true)}
              >
                {t("session.reauthenticate")}
              </button>
            ) : (
              <form
                className={styles.reauthForm}
                noValidate
                onSubmit={handleReauthenticate}
              >
                <label>
                  <span>{t("session.email")}</span>

                  <input
                    className={styles.editorInput}
                    type="email"
                    autoComplete="username"
                    required
                    disabled={isReauthenticating}
                    value={reauthEmail}
                    onChange={(event) => {
                      setReauthEmail(event.target.value);
                      setReauthError("");
                    }}
                  />
                </label>

                <label>
                  <span>{t("session.password")}</span>

                  <input
                    className={styles.editorInput}
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={isReauthenticating}
                    value={reauthPassword}
                    onChange={(event) => {
                      setReauthPassword(event.target.value);
                      setReauthError("");
                    }}
                  />
                </label>

                {reauthError && (
                  <p className={styles.errorMessage}>{t(reauthError)}</p>
                )}

                <div className={styles.reauthActions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    disabled={isReauthenticating}
                    onClick={() => {
                      setShowReauthForm(false);
                      setReauthPassword("");
                      setReauthError("");
                    }}
                  >
                    {t("session.cancel")}
                  </button>

                  <button
                    className={styles.saveButton}
                    type="submit"
                    disabled={isReauthenticating}
                  >
                    {isReauthenticating
                      ? t("session.signingIn")
                      : t("session.signIn")}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {saveMessage && saveMessageCategoryId === null && (
          <p
            id="menu-global-success"
            className={styles.successMessage}
            role="status"
          >
            {t(saveMessage, saveMessageVariables)}
          </p>
        )}

        {actionError && (
          <p className={styles.pageErrorMessage} role="alert">
            {t(actionError)}
          </p>
        )}

        {isCreatingCategory && (
          <section className={styles.newCategoryPanel} id="new-category-editor">
            <MenuCategoryEditor
              category={null}
              initialFormValues={newCategoryDraft}
              onFormValuesChange={setNewCategoryDraft}
              onCancel={() => {
                setNewCategoryDraft(null);
                setIsCreatingCategory(false);
              }}
              onSaved={handleCategoryCreated}
              onSubcategoryCreationFinished={() =>
                setNewSubcategoryCategoryId(null)
              }
            />
          </section>
        )}

        {menuCategories.length === 0 ? (
          <p>{t("menu.page.noCategories")}</p>
        ) : (
          <div className={styles.accordionList}>
            {menuCategories.map((category, categoryIndex) => {
              const isExpanded = category.id === expandedCategoryId;
              const isEditingCategory = editingCategoryId === category.id;
              const categoryEditorId = `category-editor-${category.id}`;
              const buttonId = `category-button-${category.id}`;
              const panelId = `category-panel-${category.id}`;
              const isCreatingItem = creatingItem?.categoryId === category.id;
              const itemCreatorId = `item-creator-${category.id}`;
              const categoryName =
                category.translations[language]?.label ||
                category.translations.pt.label ||
                category.translations.es.label ||
                category.translations.en.label ||
                category.slug;
              const itemsWithoutSubcategory = category.items.filter(
                (item) => item.subcategoryId === null
              );
              const itemGroups = [
                ...(itemsWithoutSubcategory.length > 0
                  ? [
                      {
                        id: `category-${category.id}`,
                        name: categoryName,
                        items: itemsWithoutSubcategory,
                      },
                    ]
                  : []),

                ...category.subcategories.map((subcategory) => ({
                  id: `subcategory-${subcategory.id}`,
                  name:
                    subcategory.translations.pt.name ||
                    subcategory.translations.es.name ||
                    subcategory.translations.en.name ||
                    t("menu.subcategory.fallbackWithPosition", {
                      position: subcategory.position,
                    }),
                  items: category.items.filter(
                    (item) => item.subcategoryId === subcategory.id
                  ),
                })),
              ];

              return (
                <Fragment key={category.id}>
                  {saveMessage && saveMessageCategoryId === category.id && (
                    <p
                      id={`category-success-${category.id}`}
                      className={styles.successMessage}
                      role="status"
                    >
                      {t(saveMessage, saveMessageVariables)}
                    </p>
                  )}
                  <section className={styles.accordion} key={category.id}>
                    <div className={styles.categoryHeaderRow}>
                      <div
                        className={styles.categoryOrderControls}
                        aria-label={t("menu.page.changeCategoryOrder", {
                          name: categoryName,
                        })}
                      >
                        <button
                          className={styles.orderButton}
                          type="button"
                          title={t("menu.page.moveCategoryUp", {
                            name: categoryName,
                          })}
                          aria-label={t("menu.page.moveCategoryUp", {
                            name: categoryName,
                          })}
                          disabled={
                            categoryIndex === 0 ||
                            movingCategoryId !== null ||
                            movingItemId !== null ||
                            hasOpenEditor
                          }
                          onClick={() => handleMoveCategory(category.id, "up")}
                        >
                          ↑
                        </button>

                        <span className={styles.categoryPosition}>
                          {category.position}
                        </span>

                        <button
                          className={styles.orderButton}
                          type="button"
                          title={t("menu.page.moveCategoryDown", {
                            name: categoryName,
                          })}
                          aria-label={t("menu.page.moveCategoryDown", {
                            name: categoryName,
                          })}
                          disabled={
                            categoryIndex === menuCategories.length - 1 ||
                            movingCategoryId !== null ||
                            movingItemId !== null ||
                            hasOpenEditor
                          }
                          onClick={() =>
                            handleMoveCategory(category.id, "down")
                          }
                        >
                          ↓
                        </button>
                      </div>

                      <div className={styles.categoryHeaderContent}>
                        <button
                          className={styles.accordionButton}
                          id={buttonId}
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <span className={styles.categoryIdentity}>
                            <span className={styles.categoryTitleLine}>
                              <strong>
                                {category.translations.pt.label ||
                                  category.slug}
                              </strong>

                              <span className={styles.categoryItemCount}>
                                - {category.items.length}{" "}
                                {category.items.length === 1
                                  ? t("menu.page.dishSingular")
                                  : t("menu.page.dishPlural")}
                              </span>
                            </span>
                          </span>

                          {category.imagePath && (
                            <Image
                              className={styles.categoryThumbnail}
                              src={category.imagePath}
                              alt=""
                              width={64}
                              height={64}
                              unoptimized
                            />
                          )}
                        </button>

                        <span
                          className={
                            category.isVisible
                              ? styles.statusVisible
                              : styles.statusHidden
                          }
                        >
                          {category.isVisible
                            ? t("menu.category.visible")
                            : t("menu.category.hidden")}
                        </span>

                        <button
                          className={`${styles.editButton} ${styles.categoryHeaderEditButton}`}
                          type="button"
                          disabled={isCreatingItem}
                          aria-expanded={isEditingCategory}
                          aria-controls={categoryEditorId}
                          onClick={() => {
                            if (!isExpanded) {
                              setExpandedCategoryId(category.id);
                            }

                            toggleCategoryEditor(category.id, categoryEditorId);
                          }}
                        >
                          {isEditingCategory
                            ? t("menu.page.closeCategoryEdit")
                            : t("menu.category.edit")}
                        </button>

                        <button
                          className={styles.categoryChevronButton}
                          type="button"
                          aria-label={
                            isExpanded
                              ? t("menu.page.closeCategory")
                              : t("menu.page.openCategory")
                          }
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <span className={styles.chevron} aria-hidden="true">
                            ⌄
                          </span>
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div
                        className={styles.accordionBody}
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                      >
                        <div className={styles.categoryDetails}>
                          <div className={styles.categoryActions}>
                            <button
                              className={styles.addButton}
                              type="button"
                              disabled={isEditingCategory}
                              aria-expanded={isCreatingItem}
                              aria-controls={itemCreatorId}
                              onClick={() => toggleItemCreator(category.id)}
                            >
                              {isCreatingItem
                                ? t("menu.page.closeNewItem")
                                : t("menu.item.add")}
                            </button>
                          </div>
                          <div className={styles.translationList}>
                            {languages.map((language) => (
                              <span key={language}>
                                <strong>{language.toUpperCase()}</strong>{" "}
                                {category.translations[language].label}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isEditingCategory && (
                          <div
                            className={styles.categoryEditorWrapper}
                            id={categoryEditorId}
                          >
                            <MenuCategoryEditor
                              category={category}
                              startCreatingSubcategory={
                                newSubcategoryCategoryId === category.id
                              }
                              onCancel={() => setEditingCategoryId(null)}
                              onSaved={() =>
                                handleCategorySaved(category.id, categoryName)
                              }
                              onDeleted={() =>
                                handleCategoryDeleted(categoryName)
                              }
                              onSubcategoriesChanged={(message) =>
                                handleCategorySubcategoriesChanged(
                                  category.id,
                                  message
                                )
                              }
                              onSubcategoryCreationFinished={() =>
                                setNewSubcategoryCategoryId(null)
                              }
                            />
                          </div>
                        )}
                        {isCreatingItem && (
                          <div
                            className={styles.categoryEditorWrapper}
                            id={itemCreatorId}
                          >
                            <MenuItemEditor
                              item={null}
                              categoryId={category.id}
                              subcategories={category.subcategories}
                              initialSubcategoryId={
                                creatingItem?.subcategoryId ?? null
                              }
                              initialFormValues={newItemDraft}
                              onFormValuesChange={setNewItemDraft}
                              onCancel={() => {
                                setNewItemDraft(null);
                                setCreatingItem(null);
                              }}
                              onSaved={() => handleItemCreated(category.id)}
                            />
                          </div>
                        )}
                        {category.items.length === 0 ? (
                          <p>{t("menu.page.noItems")}</p>
                        ) : (
                          <div className={styles.dishList}>
                            {itemGroups.map((group) => (
                              <div className={styles.dishGroup} key={group.id}>
                                <h3 className={styles.dishGroupTitle}>
                                  {group.name}
                                </h3>

                                {group.items.map((item, itemIndex) => {
                                  const isEditing = editingItemId === item.id;

                                  const editorId = `item-editor-${item.id}`;
                                  const itemName =
                                    item.translations[language]?.name ||
                                    item.translations.pt.name ||
                                    item.translations.es.name ||
                                    item.translations.en.name ||
                                    `#${item.id}`;
                                  return (
                                    <Fragment key={item.id}>
                                      <article className={styles.dishRow}>
                                        <div
                                          className={styles.orderControls}
                                          aria-label={t(
                                            "menu.page.changeItemOrder",
                                            {
                                              name: item.translations.pt.name,
                                            }
                                          )}
                                        >
                                          <button
                                            className={styles.orderButton}
                                            type="button"
                                            title={t("menu.page.moveItemUp", {
                                              name: item.translations.pt.name,
                                            })}
                                            aria-label={t(
                                              "menu.page.moveItemUp",
                                              {
                                                name: item.translations.pt.name,
                                              }
                                            )}
                                            disabled={
                                              itemIndex === 0 ||
                                              movingItemId !== null ||
                                              movingSubcategoryId !== null ||
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
                                            title={t("menu.page.moveItemDown", {
                                              name: item.translations.pt.name,
                                            })}
                                            aria-label={t(
                                              "menu.page.moveItemDown",
                                              {
                                                name: item.translations.pt.name,
                                              }
                                            )}
                                            disabled={
                                              itemIndex ===
                                                group.items.length - 1 ||
                                              movingItemId !== null ||
                                              movingSubcategoryId !== null ||
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
                                              {item.translations.es.description}
                                            </span>
                                          </div>

                                          <div>
                                            <strong>
                                              EN · {item.translations.en.name}
                                            </strong>

                                            <span>
                                              {item.translations.en.description}
                                            </span>
                                          </div>
                                        </div>

                                        <span className={styles.dishPrice}>
                                          {item.priceText ||
                                            t("menu.page.pending")}
                                        </span>

                                        <span
                                          className={
                                            item.isVisible
                                              ? styles.statusVisible
                                              : styles.statusHidden
                                          }
                                        >
                                          {item.isVisible
                                            ? t("menu.item.visible")
                                            : t("menu.item.hidden")}
                                        </span>

                                        <button
                                          className={styles.editButton}
                                          type="button"
                                          aria-expanded={isEditing}
                                          aria-controls={editorId}
                                          onClick={() =>
                                            toggleItemEditor(item.id, editorId)
                                          }
                                        >
                                          {isEditing
                                            ? t("menu.page.close")
                                            : t("menu.item.edit")}
                                        </button>
                                      </article>

                                      {isEditing && (
                                        <div
                                          className={styles.editorWrapper}
                                          id={editorId}
                                        >
                                          <MenuItemEditor
                                            item={item}
                                            categoryId={category.id}
                                            subcategories={
                                              category.subcategories
                                            }
                                            onCancel={() =>
                                              setEditingItemId(null)
                                            }
                                            onSaved={() =>
                                              handleItemSaved(
                                                category.id,
                                                itemName
                                              )
                                            }
                                            onDeleted={() =>
                                              handleItemDeleted(
                                                category.id,
                                                itemName
                                              )
                                            }
                                          />
                                        </div>
                                      )}
                                    </Fragment>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </Fragment>
              );
            })}
          </div>
        )}
      </AdminLayout>
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

  const menuCategories = await getAdminMenuCategories();

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
