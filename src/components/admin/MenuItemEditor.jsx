import Image from "next/image";
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function formatPriceInput(priceCents) {
  if (priceCents === null) {
    return "";
  }

  return (priceCents / 100)
    .toFixed(2)
    .replace(".", ",");
}

function parsePriceInput(price) {
  const normalizedPrice = price.trim();

  if (normalizedPrice === "") {
    return {
      value: null,
    };
  }

  if (
    !/^\d+(?:[.,]\d{1,2})?$/.test(
      normalizedPrice
    )
  ) {
    return {
      error:
        "Introduz um preço válido, por exemplo 12,50.",
    };
  }

  const [euros, decimalPart = ""] =
    normalizedPrice.split(/[.,]/);

  const priceCents =
    Number(euros) * 100 +
    Number(decimalPart.padEnd(2, "0"));

  if (
    !Number.isSafeInteger(priceCents) ||
    priceCents > 1000000
  ) {
    return {
      error:
        "O preço não pode ultrapassar 10 000 euros.",
    };
  }

  return {
    value: priceCents,
  };
}

function createEmptyTranslation() {
  return {
    name: "",
    description: "",
  };
}

export default function MenuItemEditor({
  item = null,
  categoryId,
  onCancel,
  onSaved,
  onDeleted,
}) {
  const isCreating = item === null;

  const formIdentifier = isCreating
    ? `new-${categoryId}`
    : item.id;

  const [formValues, setFormValues] = useState(
    () => ({
      imagePath: item?.imagePath ?? "",
      price: formatPriceInput(
        item?.priceCents ?? null
      ),

      isVisible: item?.isVisible ?? true,

      translations: item
        ? {
          pt: { ...item.translations.pt },
          es: { ...item.translations.es },
          en: { ...item.translations.en },
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

    const parsedPrice = parsePriceInput(
      formValues.price
    );

    if (parsedPrice.error) {
      setErrorMessage(parsedPrice.error);
      return;
    }

    const endpoint = isCreating
      ? "/api/admin/menu/items"
      : `/api/admin/menu/items/${item.id}`;

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
          ...(isCreating
            ? {
              categoryId,
            }
            : {}),

          imagePath:
            formValues.imagePath.trim() || null,
          priceCents: parsedPrice.value,
          isVisible: formValues.isVisible,
          translations: formValues.translations,
        }),
      });

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const validationMessage =
          result.details?.[0]?.message;

        setErrorMessage(
          validationMessage ??
          result.error ??
          "Não foi possível guardar o prato."
        );

        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      await onSaved(result.item);
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
        `/api/admin/menu/items/${item.id}`,
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
          "Não foi possível eliminar o prato."
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
              ? "Adicionar prato"
              : isConfirmingDelete
                ? "Eliminar prato"
                : `Editar prato #${item.position}`}
          </h3>

          {!isCreating && (
            <p>
              {isConfirmingDelete
                ? item.translations.pt.name ||
                item.translations.es.name ||
                item.translations.en.name ||
                `Prato #${item.position}`
                : "Altera os textos, o preço ou a visibilidade."}
            </p>
          )}
        </div>
      </div>

      <div
        className={styles.translationEditorList}
      >
        {languages.map((language) => {
          const translation =
            formValues.translations[language.code];

          const nameId =
            `item-${formIdentifier}-${language.code}-name`;

          const descriptionId =
            `item-${formIdentifier}-${language.code}-description`;

          return (
            <fieldset
              className={styles.translationEditor}
              key={language.code}
              disabled={isFormLocked}
            >
              <legend>{language.label}</legend>

              <label
                className={styles.editorField}
                htmlFor={nameId}
              >
                Nome
              </label>

              <input
                className={styles.editorInput}
                id={nameId}
                type="text"
                maxLength={120}
                value={translation.name}
                onChange={(event) =>
                  updateTranslation(
                    language.code,
                    "name",
                    event.target.value
                  )
                }
              />

              <label
                className={styles.editorField}
                htmlFor={descriptionId}
              >
                Descrição
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

      <div className={styles.imageUploadField}>
        <span className={styles.editorField}>
          Imagem do prato
        </span>

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
              alt="Pré-visualização do prato"
              width={88}
              height={88}
              unoptimized
            />
          )}
        </div>

        <small>
          Imagem opcional. PNG, JPEG ou WebP. Máximo de 5 MB.
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
          <button
            className={styles.removeImageButton}
            type="button"
            disabled={isFormLocked}
            onClick={() =>
              setFormValues((currentValues) => ({
                ...currentValues,
                imagePath: "",
              }))
            }
          >
            Remover imagem do prato
          </button>
        )}
      </div>
      <div className={styles.editorOptions}>
        <label className={styles.priceField}>
          <span>Preço em euros</span>

          <input
            className={styles.editorInput}
            type="text"
            inputMode="decimal"
            placeholder="Ex.: 12,50"
            disabled={isFormLocked}
            value={formValues.price}
            onChange={(event) =>
              setFormValues((currentValues) => ({
                ...currentValues,
                price: event.target.value,
              }))
            }
          />

          <small>
            Deixa vazio para apresentar “Pendente”.
          </small>
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

          <span>Visível no site público</span>
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

      {!isCreating && isConfirmingDelete && (
        <div
          className={styles.deleteConfirmation}
          role="alert"
        >
          <strong>
            Eliminar “{item.translations.pt.name}”?
          </strong>

          <p>
            Esta ação é permanente. As traduções do
            prato também serão eliminadas.
          </p>

          <div
            className={
              styles.deleteConfirmationActions
            }
          >
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isBusy}
              onClick={() =>
                setIsConfirmingDelete(false)
              }
            >
              Manter prato
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
            Eliminar prato
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
              ? "Criar prato"
              : "Guardar alterações"}
        </button>
      </div>
    </form>
  );
}