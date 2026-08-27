import { useState } from "react";

import styles from "../../styles/Admin.module.css";

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

function isAllowedImagePath(imagePath) {
  return (
    imagePath.startsWith("/assets/images/") ||
    imagePath.startsWith("/uploads/")
  );
}

export default function MenuCategoryEditor({
  category,
  onCancel,
  onSaved,
}) {
  const [formValues, setFormValues] = useState(
    () => ({
      imagePath: category.imagePath ?? "",
      isVisible: category.isVisible,

      translations: {
        pt: { ...category.translations.pt },
        es: { ...category.translations.es },
        en: { ...category.translations.en },
      },
    })
  );

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function updateTranslation(
    language,
    field,
    value
  ) {
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

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const imagePath =
      formValues.imagePath.trim();

    if (!isAllowedImagePath(imagePath)) {
      setErrorMessage(
        "A imagem deve estar em /assets/images/ ou /uploads/."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/menu/categories/${category.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            imagePath,
            isVisible: formValues.isVisible,
            translations: formValues.translations,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const validationMessage =
          result.details?.[0]?.message;

        setErrorMessage(
          validationMessage ??
            result.error ??
            "Não foi possível guardar a categoria."
        );

        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      await onSaved();
    } catch {
      setErrorMessage(
        "Não foi possível comunicar com o servidor."
      );

      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={styles.itemEditor}
      onSubmit={handleSubmit}
    >
      <div className={styles.editorHeading}>
        <div>
          <h3>Editar categoria</h3>

          <p>
            Slug: {category.slug} · Ordem:{" "}
            {category.position}
          </p>
        </div>
      </div>

      <div
        className={styles.translationEditorList}
      >
        {languages.map((language) => {
          const translation =
            formValues.translations[language.code];

          const labelId =
            `category-${category.id}-${language.code}-label`;

          const titleId =
            `category-${category.id}-${language.code}-title`;

          return (
            <fieldset
              className={styles.translationEditor}
              key={language.code}
              disabled={isSubmitting}
            >
              <legend>{language.label}</legend>

              <label
                className={styles.editorField}
                htmlFor={labelId}
              >
                Nome do separador
              </label>

              <input
                className={styles.editorInput}
                id={labelId}
                type="text"
                required
                maxLength={120}
                value={translation.label}
                onChange={(event) =>
                  updateTranslation(
                    language.code,
                    "label",
                    event.target.value
                  )
                }
              />

              <label
                className={styles.editorField}
                htmlFor={titleId}
              >
                Título da categoria
              </label>

              <input
                className={styles.editorInput}
                id={titleId}
                type="text"
                required
                maxLength={120}
                value={translation.title}
                onChange={(event) =>
                  updateTranslation(
                    language.code,
                    "title",
                    event.target.value
                  )
                }
              />
            </fieldset>
          );
        })}
      </div>

      <div className={styles.editorOptions}>
        <label className={styles.priceField}>
          <span>Caminho da imagem</span>

          <input
            className={styles.editorInput}
            type="text"
            required
            maxLength={500}
            disabled={isSubmitting}
            value={formValues.imagePath}
            onChange={(event) =>
              setFormValues((currentValues) => ({
                ...currentValues,
                imagePath: event.target.value,
              }))
            }
          />

          <small>
            Ex.: /assets/images/menu/imagem.webp
          </small>
        </label>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            disabled={isSubmitting}
            checked={formValues.isVisible}
            onChange={(event) =>
              setFormValues((currentValues) => ({
                ...currentValues,
                isVisible: event.target.checked,
              }))
            }
          />

          <span>Categoria visível no site público</span>
        </label>
      </div>

      {errorMessage && (
        <p
          className={styles.editorError}
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <div className={styles.editorActions}>
        <button
          className={styles.cancelButton}
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </button>

        <button
          className={styles.saveButton}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "A guardar..."
            : "Guardar categoria"}
        </button>
      </div>
    </form>
  );
}
