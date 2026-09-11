import { useState } from "react";

import styles from "../../styles/Admin.module.css";
import { adminFetch } from "../../lib/adminFetch";

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
        const validationMessage = result.details?.[0]?.message;

        setErrorMessage(
          validationMessage ??
            result.error ??
            "Não foi possível guardar a subcategoria."
        );

        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      await onSaved(result.subcategory);
    } catch {
      setErrorMessage("Não foi possível comunicar com o servidor.");

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
          setIsSubmitting(false);
          return;
        }
        setErrorMessage(
          result.error ?? "Não foi possível eliminar a subcategoria."
        );

        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      await onDeleted();
    } catch (error) {
      console.error("Erro ao guardar subcategoria:", error);

      setErrorMessage("Não foi possível concluir a operação.");

      setIsSubmitting(false);
    }
  }

  const subcategoryName =
    subcategory?.translations.pt.name ||
    subcategory?.translations.es.name ||
    subcategory?.translations.en.name ||
    "Subcategoria";

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
              ? "Adicionar subcategoria"
              : isConfirmingDelete
                ? "Eliminar subcategoria"
                : "Editar subcategoria"}
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
                Nome
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

        <span>Subcategoria visível no site público</span>
      </label>

      {errorMessage && (
        <p className={styles.editorError} role="alert">
          {errorMessage}
        </p>
      )}

      {!isCreating && isConfirmingDelete && (
        <div className={styles.deleteConfirmation} role="alert">
          <strong>Eliminar “{subcategoryName}”?</strong>

          <p>
            Os pratos desta subcategoria não serão eliminados. Ficarão sem
            subcategoria.
          </p>

          <div className={styles.deleteConfirmationActions}>
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isBusy}
              onClick={() => setIsConfirmingDelete(false)}
            >
              Manter subcategoria
            </button>

            <button
              className={styles.confirmDeleteButton}
              type="button"
              disabled={isBusy}
              onClick={handleDelete}
            >
              {isDeleting ? "A eliminar..." : "Eliminar permanentemente"}
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
          Cancelar
        </button>

        <button
          className={styles.subcategoryAddButton}
          type={embedded ? "button" : "submit"}
          onClick={embedded ? handleSubmit : undefined}
        >
          {isSubmitting
            ? "A guardar..."
            : isCreating
              ? "Criar subcategoria"
              : "Guardar subcategoria"}
        </button>
      </div>
    </EditorContainer>
  );
}
