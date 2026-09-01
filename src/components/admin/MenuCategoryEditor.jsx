import { useState } from "react";

import styles from "../../styles/Admin.module.css";
import Image from "next/image";

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function isAllowedImagePath(imagePath) {
  return (
    imagePath.startsWith("/assets/images/") ||
    imagePath.startsWith("/uploads/")
  );
}

function createEmptyTranslation() {
  return {
    label: "",
    title: "",
  };
}

export default function MenuCategoryEditor({
  category = null,
  onCancel,
  onSaved,
  onDeleted,
}) {
  const isCreating = category === null;

  const formIdentifier = isCreating
    ? "new"
    : category.id;

  const [formValues, setFormValues] = useState(
    () => ({
      imagePath: category?.imagePath ?? "",

      isVisible:
        category?.isVisible ?? false,

      translations: category
        ? {
          pt: { ...category.translations.pt },
          es: { ...category.translations.es },
          en: { ...category.translations.en },
        }
        : {
          pt: createEmptyTranslation(),
          es: createEmptyTranslation(),
          en: createEmptyTranslation(),
        },
    })
  );

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isConfirmingDelete,
    setIsConfirmingDelete,
  ] = useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
  isUploadingImage,
  setIsUploadingImage,
] = useState(false);

  const isBusy =
    isSubmitting ||
    isDeleting ||
    isUploadingImage;

  const isFormLocked =
    isBusy || isConfirmingDelete;

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

  async function handleImageUpload(event) {
    const input = event.currentTarget;
    const image = input.files?.[0];

    if (!image) {
      return;
    }

    setErrorMessage("");

    if (!allowedImageTypes.has(image.type)) {
      setErrorMessage(
        "Seleciona uma imagem PNG, JPEG ou WebP."
      );
      input.value = "";
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
      setErrorMessage(
        "A imagem não pode ultrapassar 5 MB."
      );
      input.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setIsUploadingImage(true);

    try {
      const response = await fetch(
        "/api/admin/menu/uploads",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          result.error ??
          "Não foi possível carregar a imagem."
        );
        return;
      }

      setFormValues((currentValues) => ({
        ...currentValues,
        imagePath: result.imagePath,
      }));
    } catch {
      setErrorMessage(
        "Não foi possível comunicar com o servidor."
      );
    } finally {
      setIsUploadingImage(false);
      input.value = "";
    }
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

    const endpoint = isCreating
      ? "/api/admin/menu/categories"
      : `/api/admin/menu/categories/${category.id}`;

    const method = isCreating
      ? "POST"
      : "PATCH";

    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method,

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
      await onSaved(result.category);
    } catch {
      setErrorMessage(
        "Não foi possível comunicar com o servidor."
      );

      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setErrorMessage("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/menu/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          result.error ??
          "Não foi possível eliminar a categoria."
        );

        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      await onDeleted();
    } catch {
      setErrorMessage(
        "Não foi possível comunicar com o servidor."
      );

      setIsDeleting(false);
    }
  }

  return (
    <form
      className={styles.itemEditor}
      onSubmit={handleSubmit}
    >
      <div className={styles.editorHeading}>
        <div>
          <h3>
            {isCreating
              ? "Adicionar categoria"
              : isConfirmingDelete
                ? "Eliminar categoria"
                : "Editar categoria"}
          </h3>

          <p>
            {isCreating
              ? "O slug e a posição serão criados automaticamente."
              : isConfirmingDelete
                ? category.translations.pt.label
                : `Slug: ${category.slug} · Ordem: ${category.position}`}
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
            `category-${formIdentifier}-${language.code}-label`;

          const titleId =
            `category-${formIdentifier}-${language.code}-title`;

          return (
            <fieldset
              className={styles.translationEditor}
              key={language.code}
              disabled={isFormLocked}
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

      <div className={styles.imageUploadField}>
        <span className={styles.editorField}>
          Imagem da categoria
        </span>

        {formValues.imagePath && (
          <Image
            className={styles.imagePreview}
            src={formValues.imagePath}
            alt="Pré-visualização da categoria"
            width={180}
            height={180}
            unoptimized
          />
        )}

        <input
          className={styles.editorInput}
          id={`category-${formIdentifier}-image`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={isFormLocked}
          onChange={handleImageUpload}
        />

        <small>
          PNG, JPEG ou WebP. Máximo de 5 MB.
        </small>

        {isUploadingImage && (
          <span
            className={styles.uploadStatus}
            role="status"
          >
            A carregar imagem...
          </span>
        )}

        {formValues.imagePath && (
          <small className={styles.imagePathValue}>
            {formValues.imagePath}
          </small>
        )}
      </div>
      {errorMessage && (
        <p
          className={styles.editorError}
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {!isCreating && isConfirmingDelete && (
        <div
          className={styles.deleteConfirmation}
          role="alert"
        >
          <strong>
            Eliminar “
            {category.translations.pt.label}”?
          </strong>

          <p>
            Esta ação é permanente e só será
            permitida se a categoria estiver vazia.
          </p>

          <div
            className={
              styles.deleteConfirmationActions
            }
          >
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isFormLocked}
              onClick={() =>
                setIsConfirmingDelete(false)
              }
            >
              Manter categoria
            </button>

            <button
              className={styles.confirmDeleteButton}
              type="button"
              disabled={isBusy}
              onClick={handleDelete}
            >
              {isDeleting
                ? "A eliminar..."
                : "Eliminar permanentemente"}
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
            onClick={() =>
              setIsConfirmingDelete(true)
            }
          >
            Eliminar categoria
          </button>
        )}
        <button
          className={styles.cancelButton}
          type="button"
          disabled={isFormLocked}
          onClick={onCancel}
        >
          Cancelar
        </button>

        <button
          className={styles.saveButton}
          type="submit"
          disabled={isFormLocked}
        >
          {isSubmitting
            ? "A guardar..."
            : isCreating
              ? "Criar categoria"
              : "Guardar categoria"}
        </button>
      </div>
    </form>
  );
}
