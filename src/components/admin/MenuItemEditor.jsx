import Image from "next/image";
import { useEffect, useState } from "react";
import MenuSubcategoryEditor from "./MenuSubcategoryEditor";
import { adminFetch } from "../../lib/adminFetch";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getAdminApiErrorKey } from "../../lib/adminApiError";
import { getBusinessLanguageOption } from "../../utils/businessLanguages";

import styles from "../../styles/Admin.module.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function createEmptyTranslation() {
  return {
    name: "",
    description: "",
  };
}

export default function MenuItemEditor({
  item = null,
  categoryId,
  subcategories = [],
  initialSubcategoryId = null,
  initialFormValues = null,
  onFormValuesChange,
  onCancel,
  onSaved,
  onDeleted,
  businessLanguages,
  defaultLanguage,
}) {
  const { language, t } = useAdminLanguage();
  const languages = businessLanguages.map(getBusinessLanguageOption);
  const fallbackLanguages = [
    language,
    defaultLanguage,
    ...businessLanguages.map(({ language }) => language),
  ];
  const [availableSubcategories, setAvailableSubcategories] = useState(
    () => subcategories
  );

  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);

  const isCreating = item === null;

  const formIdentifier = isCreating ? `new-${categoryId}` : item.id;

  const [formValues, setFormValues] = useState(() => {
    const initialValues = isCreating ? initialFormValues : item;

    return {
      subcategoryId: String(
        initialValues?.subcategoryId ?? initialSubcategoryId ?? ""
      ),
      imagePath: initialValues?.imagePath ?? "",
      priceText: initialValues?.priceText ?? "",
      isVisible: initialValues?.isVisible ?? true,

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

  const [isConfirmingImageRemoval, setIsConfirmingImageRemoval] =
    useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isBusy = isSubmitting || isDeleting || isUploadingImage;

  const isFormLocked =
    isBusy ||
    isConfirmingDelete ||
    isConfirmingImageRemoval ||
    isCreatingSubcategory;

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
      setErrorMessage("menu.item.invalidImageType");

      input.value = "";
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
      setErrorMessage("menu.item.imageTooLarge");

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
          getAdminApiErrorKey(result.error, "menu.item.imageUploadFailed")
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
    event.preventDefault();
    setErrorMessage("");

    const hasAnyName = languages.some(({ code }) =>
      (formValues.translations[code]?.name ?? "").trim()
    );

    if (!hasAnyName) {
      setErrorMessage("menu.item.nameRequired");
      return;
    }

    const endpoint = isCreating
      ? "/api/admin/menu/items"
      : `/api/admin/menu/items/${item.id}`;

    const method = isCreating ? "POST" : "PATCH";

    setIsSubmitting(true);

    try {
      const response = await adminFetch(endpoint, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...(isCreating
            ? {
                categoryId,
              }
            : {}),

          subcategoryId:
            formValues.subcategoryId === ""
              ? null
              : Number(formValues.subcategoryId),
          imagePath: formValues.imagePath.trim() || null,
          // ENVIO PARA A API
          priceText: formValues.priceText.trim() || null,
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
          getAdminApiErrorKey(result.error, "menu.item.saveFailed")
        );

        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      await onSaved(result.item);
    } catch {
      setErrorMessage("menu.common.serverError");

      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setErrorMessage("");
    setIsDeleting(true);

    try {
      const response = await adminFetch(`/api/admin/menu/items/${item.id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }
        setErrorMessage(
          getAdminApiErrorKey(result.error, "menu.item.deleteFailed")
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

  const itemName =
    fallbackLanguages
      .map((code) => item?.translations?.[code]?.name)
      .find((value) => typeof value === "string" && value.trim().length > 0) ||
    t("menu.item.fallbackName", {
      position: item?.position ?? "",
    });
  return (
    <form className={styles.itemEditor} onSubmit={handleSubmit}>
      <div className={styles.editorHeading}>
        <div>
          <h3>
            {isCreating
              ? t("menu.item.add")
              : isConfirmingDelete
                ? t("menu.item.delete")
                : t("menu.item.edit", {
                    position: item.position,
                  })}
          </h3>

          {!isCreating && (
            <p>
              {isConfirmingDelete ? itemName : t("menu.item.editDescription")}
            </p>
          )}
        </div>
      </div>

      <div className={styles.translationEditorList}>
        {languages.map((language) => {
          const translation =
            formValues.translations[language.code] ?? createEmptyTranslation();

          const nameId = `item-${formIdentifier}-${language.code}-name`;

          const descriptionId = `item-${formIdentifier}-${language.code}-description`;

          return (
            <fieldset
              className={styles.translationEditor}
              key={language.code}
              disabled={isFormLocked}
            >
              <legend>{language.label}</legend>

              <label className={styles.editorField} htmlFor={nameId}>
                {t("menu.common.name")}
              </label>

              <input
                className={styles.editorInput}
                id={nameId}
                type="text"
                maxLength={120}
                value={translation.name}
                onChange={(event) =>
                  updateTranslation(language.code, "name", event.target.value)
                }
              />

              <label className={styles.editorField} htmlFor={descriptionId}>
                {t("menu.item.description")}
              </label>

              <textarea
                className={styles.editorTextarea}
                id={descriptionId}
                maxLength={500}
                rows={4}
                value={translation.description}
                onChange={(event) =>
                  updateTranslation(
                    language.code,
                    "description",
                    event.target.value
                  )
                }
              />
            </fieldset>
          );
        })}
      </div>
      <div className={styles.itemSubcategories}>
        <div className={styles.itemSubcategoriesHeading}>
          <div>
            <strong>{t("menu.item.subcategory")}</strong>
            <p>{t("menu.item.subcategoryDescription")}</p>
          </div>

          <button
            className={styles.subcategoryAddButton}
            type="button"
            disabled={isFormLocked}
            onClick={() => setIsCreatingSubcategory(true)}
          >
            + {t("menu.subcategory.add")}
          </button>
        </div>

        <div className={styles.itemSubcategoryOptions}>
          <label className={styles.itemSubcategoryOption}>
            <input
              type="radio"
              name={`item-${formIdentifier}-subcategory`}
              value=""
              disabled={isFormLocked}
              checked={formValues.subcategoryId === ""}
              onChange={() =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  subcategoryId: "",
                }))
              }
            />

            <span>{t("menu.item.noSubcategory")}</span>
          </label>

          {availableSubcategories.map((subcategory) => {
            const name =
              fallbackLanguages
                .map((code) => subcategory.translations[code]?.name)
                .find(
                  (value) =>
                    typeof value === "string" && value.trim().length > 0
                ) ||
              t("menu.subcategory.fallbackWithPosition", {
                position: subcategory.position,
              });

            return (
              <div
                className={styles.itemSubcategoryOption}
                key={subcategory.id}
              >
                <label>
                  <input
                    type="radio"
                    name={`item-${formIdentifier}-subcategory`}
                    value={subcategory.id}
                    disabled={isFormLocked}
                    checked={
                      formValues.subcategoryId === String(subcategory.id)
                    }
                    onChange={() =>
                      setFormValues((currentValues) => ({
                        ...currentValues,
                        subcategoryId: String(subcategory.id),
                      }))
                    }
                  />

                  <span>{name}</span>
                </label>
              </div>
            );
          })}
        </div>

        {isCreatingSubcategory && (
          <MenuSubcategoryEditor
            embedded
            subcategory={null}
            categoryId={categoryId}
            onCancel={() => setIsCreatingSubcategory(false)}
            businessLanguages={businessLanguages}
            defaultLanguage={defaultLanguage}
            onSaved={async (subcategory) => {
              setAvailableSubcategories((currentSubcategories) => [
                ...currentSubcategories,
                subcategory,
              ]);

              setFormValues((currentValues) => ({
                ...currentValues,
                subcategoryId: String(subcategory.id),
              }));

              setIsCreatingSubcategory(false);
            }}
          />
        )}
      </div>

      <div className={styles.imageUploadField}>
        <span className={styles.editorField}>{t("menu.item.image")}</span>

        <div className={styles.categoryImageUploadRow}>
          <input
            className={styles.categoryImageInput}
            id={`item-${formIdentifier}-image`}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={isFormLocked}
            onChange={handleImageUpload}
          />

          {formValues.imagePath && (
            <Image
              className={styles.categoryImageThumbnail}
              src={formValues.imagePath}
              alt={t("menu.item.imagePreviewAlt")}
              width={88}
              height={88}
              unoptimized
            />
          )}
        </div>

        <small>{t("menu.item.imageHelp")}</small>

        {isUploadingImage && (
          <span className={styles.uploadStatus} role="status">
            {t("menu.item.uploadingImage")}
          </span>
        )}

        {formValues.imagePath && (
          <button
            className={styles.removeImageButton}
            type="button"
            disabled={isFormLocked}
            onClick={() => setIsConfirmingImageRemoval(true)}
          >
            {t("menu.item.removeImage")}
          </button>
        )}
      </div>
      {isConfirmingImageRemoval && (
        <div className={styles.deleteConfirmation} role="alert">
          <strong>{t("menu.item.removeImageQuestion")}</strong>

          <p>{t("menu.item.removeImageDescription")}</p>

          <div className={styles.deleteConfirmationActions}>
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isBusy}
              onClick={() => setIsConfirmingImageRemoval(false)}
            >
              {t("menu.item.keepImage")}
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
              {t("menu.item.confirmRemoveImage")}
            </button>
          </div>
        </div>
      )}
      <div className={styles.editorOptions}>
        <label className={styles.priceField}>
          <span>{t("menu.item.price")}</span>

          <input
            className={styles.editorInput}
            type="text"
            maxLength={200}
            placeholder={t("menu.item.pricePlaceholder")}
            disabled={isFormLocked}
            value={formValues.priceText}
            onChange={(event) =>
              setFormValues((currentValues) => ({
                ...currentValues,
                priceText: event.target.value,
              }))
            }
          />

          <small>{t("menu.item.priceHelp")}</small>
        </label>

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

          <span>{t("menu.item.visible")}</span>
        </label>
      </div>

      {errorMessage && (
        <p className={styles.editorError} role="alert">
          {t(errorMessage)}
        </p>
      )}

      {!isCreating && isConfirmingDelete && (
        <div className={styles.deleteConfirmation} role="alert">
          <strong>
            {t("menu.item.deleteQuestion", {
              name: itemName,
            })}
          </strong>

          <p>{t("menu.item.deleteDescription")}</p>

          <div className={styles.deleteConfirmationActions}>
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isBusy}
              onClick={() => setIsConfirmingDelete(false)}
            >
              {t("menu.item.keep")}
            </button>

            <button
              className={styles.confirmDeleteButton}
              type="button"
              disabled={isBusy}
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
            {t("menu.item.delete")}
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
          disabled={isFormLocked}
        >
          {isSubmitting
            ? t("menu.common.saving")
            : isCreating
              ? t("menu.item.create")
              : t("menu.item.save")}
        </button>
      </div>
    </form>
  );
}
