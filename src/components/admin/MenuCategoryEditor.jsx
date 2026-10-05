import { useEffect, useState } from "react";
import Image from "next/image";
import MenuSubcategoryEditor from "./MenuSubcategoryEditor";
import { adminFetch } from "../../lib/adminFetch";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getAdminApiErrorKey } from "../../lib/adminApiError";
import { getBusinessLanguageOption } from "../../utils/businessLanguages";

import styles from "../../styles/Admin.module.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function isAllowedImagePath(imagePath) {
  return (
    imagePath.startsWith("/assets/images/") || imagePath.startsWith("/uploads/")
  );
}

function createEmptyTranslation() {
  return {
    label: "",
    title: "",
    highlightText: "",
  };
}

export default function MenuCategoryEditor({
  category = null,
  initialFormValues = null,
  onFormValuesChange,
  onCancel,
  onSaved,
  onDeleted,
  onSubcategoriesChanged,
  onSubcategoryCreationFinished,
  startCreatingSubcategory = false,
  businessLanguages,
  defaultLanguage,
}) {
  const { language, t } = useAdminLanguage();
  const languages = businessLanguages.map(getBusinessLanguageOption);

  const fallbackLanguages = [
    language,
    defaultLanguage,
    ...languages.map(({ code }) => code),
  ];
  const isCreating = category === null;
  const formIdentifier = isCreating ? "new" : category.id;
  const [formValues, setFormValues] = useState(() => {
    const initialValues = isCreating ? initialFormValues : category;

    return {
      imagePath: initialValues?.imagePath ?? "",
      isVisible: initialValues?.isVisible ?? false,

      translations: Object.fromEntries(
        languages.map(({ code }) => [
          code,
          {
            ...createEmptyTranslation(),
            ...initialValues?.translations?.[code],
          },
        ])
      ),
    };
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const isBusy = isSubmitting || isDeleting || isUploadingImage;
  const [isConfirmingImageRemoval, setIsConfirmingImageRemoval] =
    useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(
    startCreatingSubcategory
  );
  const [movingSubcategoryId, setMovingSubcategoryId] = useState(null);
  const isFormLocked =
    isBusy ||
    isConfirmingDelete ||
    isConfirmingImageRemoval ||
    isCreatingSubcategory ||
    editingSubcategoryId ||
    movingSubcategoryId !== null;

  useEffect(() => {
    if (isCreating) {
      onFormValuesChange?.(formValues);
    }
  }, [formValues, isCreating, onFormValuesChange]);

  function updateTranslation(language, field, value) {
    setFormValues((currentValues) => ({
      ...currentValues,

      translations: {
        ...currentValues.translations,

        [language]: {
          ...currentValues.translations[language],
          [field]: value,
        },
      },
    }));
  }

  async function handleImageUpload(event) {
    const input = event.currentTarget;
    const image = input.files?.[0];

    if (!image) {
      return;
    }

    setErrorMessage("");

    if (!allowedImageTypes.has(image.type)) {
      setErrorMessage("menu.category.invalidImageType");
      input.value = "";
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
      setErrorMessage("menu.category.imageTooLarge");
      input.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setIsUploadingImage(true);

    try {
      const response = await adminFetch("/api/admin/menu/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }

        setErrorMessage(
          getAdminApiErrorKey(result.error, "apiErrors.imageUploadFailed")
        );

        return;
      }

      setFormValues((currentValues) => ({
        ...currentValues,
        imagePath: result.imagePath,
      }));
    } catch {
      setErrorMessage("menu.common.serverError");
    } finally {
      setIsUploadingImage(false);
      input.value = "";
    }
  }

  async function handleSubmit(event) {
    event?.preventDefault();
    setErrorMessage("");

    const hasCompleteTranslation = languages.some(({ code }) => {
      const translation =
        formValues.translations[code] ?? createEmptyTranslation();

      return translation.label.trim() && translation.title.trim();
    });

    if (!hasCompleteTranslation) {
      setErrorMessage("menu.category.nameAndTitleRequired");
      return;
    }

    const submitIntent = event.nativeEvent?.submitter?.value ?? "save";

    const imagePath = formValues.imagePath.trim();

    if (imagePath && !isAllowedImagePath(imagePath)) {
      setErrorMessage("menu.category.invalidImagePath");
      return;
    }

    const endpoint = isCreating
      ? "/api/admin/menu/categories"
      : `/api/admin/menu/categories/${category.id}`;

    const method = isCreating ? "POST" : "PATCH";

    setIsSubmitting(true);

    try {
      const response = await adminFetch(endpoint, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          imagePath: imagePath || null,
          isVisible: formValues.isVisible,
          translations: Object.fromEntries(
            languages.map(({ code }) => [
              code,
              formValues.translations[code] ?? createEmptyTranslation(),
            ])
          ),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }

        setErrorMessage(
          getAdminApiErrorKey(
            result.error,
            isCreating
              ? "apiErrors.categoryCreateFailed"
              : "apiErrors.categoryUpdateFailed"
          )
        );

        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      await onSaved(result.category, {
        addSubcategory: submitIntent === "add-subcategory",
      });
    } catch {
      setErrorMessage("menu.common.serverError");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setErrorMessage("");

    if ((category?.items?.length ?? 0) > 0) {
      setErrorMessage("menu.category.deleteNotEmpty");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await adminFetch(
        `/api/admin/menu/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }

        setErrorMessage(
          getAdminApiErrorKey(result.error, "apiErrors.categoryDeleteFailed")
        );

        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      await onDeleted();
    } catch {
      setErrorMessage("menu.common.serverError");

      setIsDeleting(false);
    }
  }

  async function handleMoveSubcategory(subcategoryId, direction) {
    setErrorMessage("");
    setMovingSubcategoryId(subcategoryId);

    try {
      const response = await adminFetch("/api/admin/menu/subcategories/order", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          subcategoryId,
          direction,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }

        setErrorMessage(
          getAdminApiErrorKey(result.error, "apiErrors.subcategoryOrderFailed")
        );

        return;
      }

      if (result.moved) {
        await onSubcategoriesChanged("menu.category.subcategoryUpdated");
      }
    } catch {
      setErrorMessage("menu.common.serverError");
    } finally {
      setMovingSubcategoryId(null);
    }
  }
  const categoryName =
    fallbackLanguages
      .map((code) => category?.translations?.[code]?.label)
      .find((value) => typeof value === "string" && value.trim().length > 0) ||
    category?.slug ||
    "";
  return (
    <form className={styles.itemEditor} onSubmit={handleSubmit}>
      <div className={styles.editorHeading}>
        <div>
          <h3>
            {isCreating
              ? t("menu.category.add")
              : isConfirmingDelete
                ? t("menu.category.delete")
                : t("menu.category.edit")}
          </h3>

          {!isCreating && isConfirmingDelete && <p>{categoryName}</p>}
        </div>
      </div>
      <div className={styles.translationEditorList}>
        {languages.map((language) => {
          const translation =
            formValues.translations[language.code] ?? createEmptyTranslation();
          const labelId = `category-${formIdentifier}-${language.code}-label`;
          const titleId = `category-${formIdentifier}-${language.code}-title`;
          const highlightTextId = `category-${formIdentifier}-${language.code}-highlightText`;

          return (
            <fieldset
              className={styles.translationEditor}
              key={language.code}
              disabled={isFormLocked}
            >
              <legend>{language.label}</legend>

              <label className={styles.editorField} htmlFor={labelId}>
                {t("menu.category.tabName")}
              </label>

              <input
                className={styles.editorInput}
                id={labelId}
                type="text"
                maxLength={120}
                value={translation.label}
                onChange={(event) =>
                  updateTranslation(language.code, "label", event.target.value)
                }
              />

              <label className={styles.editorField} htmlFor={titleId}>
                {t("menu.category.title")}
              </label>

              <input
                className={styles.editorInput}
                id={titleId}
                type="text"
                maxLength={120}
                value={translation.title}
                onChange={(event) =>
                  updateTranslation(language.code, "title", event.target.value)
                }
              />
              <label className={styles.editorField} htmlFor={highlightTextId}>
                {t("menu.category.highlightText")}
              </label>

              <textarea
                className={styles.editorInput}
                id={highlightTextId}
                maxLength={300}
                rows={2}
                value={translation.highlightText ?? ""}
                onChange={(event) =>
                  updateTranslation(
                    language.code,
                    "highlightText",
                    event.target.value
                  )
                }
              />
            </fieldset>
          );
        })}
      </div>
      <div className={styles.categorySubcategories}>
        <div className={styles.categorySubcategoriesHeading}>
          <div>
            <strong>{t("menu.category.subcategories")}</strong>
            <p>{t("menu.category.subcategoriesDescription")}</p>
          </div>

          {!isCreating && !isCreatingSubcategory && (
            <button
              className={styles.subcategoryEditButton}
              type="button"
              disabled={isFormLocked || editingSubcategoryId !== null}
              onClick={() => {
                setEditingSubcategoryId(null);
                setIsCreatingSubcategory(true);
              }}
            >
              + {t("menu.subcategory.add")}
            </button>
          )}
        </div>

        {isCreating ? (
          <>
            <p>{t("menu.category.subcategoriesOptional")}</p>
            <button
              className={styles.subcategoryEditButton}
              type="submit"
              value="add-subcategory"
              disabled={isFormLocked}
            >
              + {t("menu.subcategory.add")}
            </button>
          </>
        ) : (
          <>
            {category.subcategories.length === 0 && !isCreatingSubcategory && (
              <p className={styles.emptyState}>
                {t("menu.category.noSubcategories")}
              </p>
            )}

            {category.subcategories.map((subcategory, subcategoryIndex) => {
              const subcategoryName =
                fallbackLanguages
                  .map((code) => subcategory.translations[code]?.name)
                  .find(
                    (value) =>
                      typeof value === "string" && value.trim().length > 0
                  ) ||
                t("menu.subcategory.fallbackWithPosition", {
                  position: subcategory.position,
                });

              const isEditing = editingSubcategoryId === subcategory.id;

              return (
                <div
                  className={styles.categorySubcategory}
                  key={subcategory.id}
                >
                  {!isEditing && (
                    <div className={styles.categorySubcategorySummary}>
                      <div
                        className={styles.orderControls}
                        aria-label={t("menu.category.changeSubcategoryOrder", {
                          name: subcategoryName,
                        })}
                      >
                        <button
                          className={styles.orderButton}
                          type="button"
                          title={t("menu.category.moveSubcategoryUp", {
                            name: subcategoryName,
                          })}
                          aria-label={t("menu.category.moveSubcategoryUp", {
                            name: subcategoryName,
                          })}
                          disabled={subcategoryIndex === 0 || isFormLocked}
                          onClick={() =>
                            handleMoveSubcategory(subcategory.id, "up")
                          }
                        >
                          ↑
                        </button>

                        <span className={styles.dishOrder}>
                          {subcategory.position}
                        </span>

                        <button
                          className={styles.orderButton}
                          type="button"
                          title={t("menu.category.moveSubcategoryDown", {
                            name: subcategoryName,
                          })}
                          aria-label={t("menu.category.moveSubcategoryDown", {
                            name: subcategoryName,
                          })}
                          disabled={
                            subcategoryIndex ===
                              category.subcategories.length - 1 || isFormLocked
                          }
                          onClick={() =>
                            handleMoveSubcategory(subcategory.id, "down")
                          }
                        >
                          ↓
                        </button>
                      </div>
                      <div>
                        <strong>{subcategoryName}</strong>

                        <span>
                          {subcategory.isVisible
                            ? t("menu.category.visible")
                            : t("menu.category.hidden")}
                        </span>
                      </div>

                      <button
                        className={styles.subcategoryEditButton}
                        type="button"
                        disabled={
                          isFormLocked ||
                          isCreatingSubcategory ||
                          editingSubcategoryId !== null
                        }
                        onClick={() => setEditingSubcategoryId(subcategory.id)}
                      >
                        {t("menu.category.editSubcategory")}
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <MenuSubcategoryEditor
                      embedded
                      subcategory={subcategory}
                      categoryId={category.id}
                      onCancel={() => setEditingSubcategoryId(null)}
                      businessLanguages={businessLanguages}
                      defaultLanguage={defaultLanguage}
                      onSaved={async () => {
                        setEditingSubcategoryId(null);

                        await onSubcategoriesChanged(
                          "menu.category.subcategoryUpdated"
                        );
                      }}
                      onDeleted={async () => {
                        setEditingSubcategoryId(null);

                        await onSubcategoriesChanged(
                          "menu.category.subcategoryDeleted"
                        );
                      }}
                    />
                  )}
                </div>
              );
            })}

            {isCreatingSubcategory && (
              <MenuSubcategoryEditor
                embedded
                subcategory={null}
                categoryId={category.id}
                businessLanguages={businessLanguages}
                defaultLanguage={defaultLanguage}
                onCancel={() => {
                  setIsCreatingSubcategory(false);
                  onSubcategoryCreationFinished?.();
                }}
                onSaved={async () => {
                  setIsCreatingSubcategory(false);

                  onSubcategoryCreationFinished?.();

                  await onSubcategoriesChanged(
                    "menu.category.subcategoryCreated"
                  );
                }}
              />
            )}
          </>
        )}
      </div>
      <div className={styles.imageUploadField}>
        <span className={styles.editorField}>{t("menu.category.image")}</span>

        <div className={styles.categoryImageUploadRow}>
          <input
            className={styles.categoryImageInput}
            id={`category-${formIdentifier}-image`}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={isFormLocked}
            onChange={handleImageUpload}
          />

          {formValues.imagePath && (
            <Image
              className={styles.categoryImageThumbnail}
              src={formValues.imagePath}
              alt={t("menu.category.imagePreviewAlt")}
              width={88}
              height={88}
              unoptimized
            />
          )}
        </div>

        <small>{t("menu.category.imageHelp")}</small>

        {isUploadingImage && (
          <span className={styles.uploadStatus} role="status">
            {t("menu.category.uploadingImage")}
          </span>
        )}
        {formValues.imagePath && (
          <button
            className={styles.removeImageButton}
            type="button"
            disabled={isFormLocked}
            onClick={() => setIsConfirmingImageRemoval(true)}
          >
            {t("menu.category.removeImage")}
          </button>
        )}
      </div>
      {isConfirmingImageRemoval && (
        <div className={styles.deleteConfirmation} role="alert">
          <strong>{t("menu.category.removeImageQuestion")}</strong>
          <p>{t("menu.category.removeImageDescription")}</p>

          <div className={styles.deleteConfirmationActions}>
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isBusy}
              onClick={() => setIsConfirmingImageRemoval(false)}
            >
              {t("menu.category.keepImage")}
            </button>

            <button
              className={styles.confirmDeleteButton}
              type="button"
              disabled={isBusy}
              onClick={() => {
                setFormValues((currentValues) => ({
                  ...currentValues,
                  imagePath: "",
                }));

                setIsConfirmingImageRemoval(false);
              }}
            >
              {t("menu.category.confirmRemoveImage")}
            </button>
          </div>
        </div>
      )}
      <label className={styles.checkboxField}>
        <input
          type="checkbox"
          disabled={isFormLocked}
          checked={formValues.isVisible}
          onChange={(event) =>
            setFormValues((currentValues) => ({
              ...currentValues,
              isVisible: event.target.checked,
            }))
          }
        />

        <span>{t("menu.category.visibleOnSite")}</span>
      </label>
      {errorMessage && (
        <p className={styles.editorError} role="alert">
          {t(errorMessage)}
        </p>
      )}

      {!isCreating && isConfirmingDelete && (
        <div className={styles.deleteConfirmation} role="alert">
          <strong>
            {t("menu.category.deleteQuestion", {
              name: categoryName,
            })}
          </strong>

          <p>{t("menu.category.deleteDescription")}</p>

          <div className={styles.deleteConfirmationActions}>
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
            >
              {t("menu.category.keep")}
            </button>

            <button
              className={styles.confirmDeleteButton}
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting
                ? t("menu.common.deleting")
                : t("menu.common.deletePermanently")}
            </button>
          </div>
        </div>
      )}

      <div className={styles.editorActions}>
        {!isCreating && !isConfirmingDelete && (
          <button
            className={styles.deleteButton}
            type="button"
            disabled={isFormLocked}
            onClick={() => setIsConfirmingDelete(true)}
          >
            {t("menu.category.delete")}
          </button>
        )}
        <button
          className={styles.cancelButton}
          type="button"
          disabled={isFormLocked}
          onClick={onCancel}
        >
          {t("menu.common.cancel")}
        </button>

        <button
          className={styles.saveButton}
          type="submit"
          value="save"
          disabled={isFormLocked}
        >
          {isSubmitting
            ? t("menu.common.saving")
            : isCreating
              ? t("menu.category.create")
              : t("menu.category.save")}
        </button>
      </div>
    </form>
  );
}
