import { useState } from "react";

import styles from "../../styles/Admin.module.css";
import { adminFetch } from "../../lib/adminFetch";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getAdminApiErrorKey } from "../../lib/adminApiError";

const languages = [
  {
    code: "pt",
    label: "Português",
  },
  {
    code: "es",
    label: "Español",
  },
  {
    code: "en",
    label: "English",
  },
];

function createEmptyTranslation() {
  return {
    name: "",
  };
}

export default function MenuSubcategoryEditor({
  subcategory = null,
  categoryId,
  onCancel,
  onSaved,
  onDeleted,
  embedded = false,
}) {
  const { language, t } = useAdminLanguage();
  const isCreating = subcategory === null;

  const formIdentifier = isCreating ? `new-${categoryId}` : subcategory.id;

  const [formValues, setFormValues] = useState(() => ({
    isVisible: subcategory?.isVisible ?? true,

    translations: subcategory
      ? {
          pt: { ...subcategory.translations.pt },
          es: { ...subcategory.translations.es },
          en: { ...subcategory.translations.en },
        }
      : {
          pt: createEmptyTranslation(),
          es: createEmptyTranslation(),
          en: createEmptyTranslation(),
        },
  }));

  const [errorMessage, setErrorMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const isBusy = isSubmitting || isDeleting;

  const isFormLocked = isBusy || isConfirmingDelete;

  function updateTranslation(language, value) {
    setFormValues((currentValues) => ({
      ...currentValues,

      translations: {
        ...currentValues.translations,

        [language]: {
          ...currentValues.translations[language],
          name: value,
        },
      },
    }));
  }

  async function handleSubmit(event) {
    event?.preventDefault();
    setErrorMessage("");

    const hasAnyName = languages.some(({ code }) =>
      formValues.translations[code].name.trim()
    );

    if (!hasAnyName) {
      setErrorMessage("menu.subcategory.nameRequired");
      return;
    }

    const endpoint = isCreating
      ? "/api/admin/menu/subcategories"
      : `/api/admin/menu/subcategories/${subcategory.id}`;

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

          isVisible: formValues.isVisible,
          translations: formValues.translations,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }
        setErrorMessage(
          getAdminApiErrorKey(result.error, "menu.subcategory.saveFailed")
        );
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      await onSaved(result.subcategory);
    } catch {
      setErrorMessage("menu.common.serverError");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setErrorMessage("");
    setIsDeleting(true);

    try {
      const response = await adminFetch(
        `/api/admin/menu/subcategories/${subcategory.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsDeleting(false);
          return;
        }

        setErrorMessage(
          getAdminApiErrorKey(result.error, "menu.subcategory.operationFailed")
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

  const subcategoryName =
    subcategory?.translations[language]?.name ||
    subcategory?.translations.pt.name ||
    subcategory?.translations.es.name ||
    subcategory?.translations.en.name ||
    t("menu.subcategory.fallbackName");

  const EditorContainer = embedded ? "div" : "form";

  return (
    <EditorContainer
      className={styles.itemEditor}
      {...(!embedded ? { onSubmit: handleSubmit } : {})}
    >
      <div className={styles.editorHeading}>
        <div>
          <h3>
            {isCreating
              ? t("menu.subcategory.add")
              : isConfirmingDelete
                ? t("menu.subcategory.delete")
                : t("menu.subcategory.edit")}
          </h3>

          {!isCreating && isConfirmingDelete && <p>{subcategoryName}</p>}
        </div>
      </div>

      <div className={styles.translationEditorList}>
        {languages.map((language) => {
          const translation = formValues.translations[language.code];

          const nameId = `subcategory-${formIdentifier}-${language.code}-name`;

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
                  updateTranslation(language.code, event.target.value)
                }
              />
            </fieldset>
          );
        })}
      </div>

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

        <span>{t("menu.subcategory.visible")}</span>
      </label>

      {errorMessage && (
        <p className={styles.editorError} role="alert">
          {t(errorMessage)}
        </p>
      )}

      {!isCreating && isConfirmingDelete && (
        <div className={styles.deleteConfirmation} role="alert">
          <strong>
            {t("menu.subcategory.deleteQuestion", {
              name: subcategoryName,
            })}
          </strong>

          <p>{t("menu.subcategory.deleteDescription")}</p>

          <div className={styles.deleteConfirmationActions}>
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isBusy}
              onClick={() => setIsConfirmingDelete(false)}
            >
              {t("menu.subcategory.keep")}
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
            disabled={isBusy}
            onClick={() => setIsConfirmingDelete(true)}
          >
            Eliminar subcategoria
          </button>
        )}

        <button
          className={styles.subcategoryAddButton}
          type="button"
          disabled={isFormLocked}
          onClick={onCancel}
        >
          {t("menu.common.cancel")}
        </button>

        <button
          className={styles.subcategoryAddButton}
          type={embedded ? "button" : "submit"}
          onClick={embedded ? handleSubmit : undefined}
        >
          {isSubmitting
            ? t("menu.common.saving")
            : isCreating
              ? t("menu.subcategory.create")
              : t("menu.subcategory.save")}
        </button>
      </div>
    </EditorContainer>
  );
}
