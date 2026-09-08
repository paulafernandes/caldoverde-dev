import Image from "next/image";
import { useState } from "react";
import styles from "../../styles/Admin.module.css";
import MenuSubcategoryEditor from "./MenuSubcategoryEditor";

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
      subcategoryId: String(
        item?.subcategoryId ??
        initialSubcategoryId ??
        ""
      ),
      imagePath: item?.imagePath ?? "",
      priceText: item?.priceText ?? "",

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

  const [availableSubcategories, setAvailableSubcategories] =
    useState(() => subcategories);

  const [
    isCreatingSubcategory,
    setIsCreatingSubcategory,
  ] = useState(false);

  const [
    editingSubcategoryId,
    setEditingSubcategoryId,
  ] = useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isConfirmingDelete,
    setIsConfirmingDelete,
  ] = useState(false);

  const [
    isConfirmingImageRemoval,
    setIsConfirmingImageRemoval,
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
    isBusy ||
    isConfirmingDelete ||
    isConfirmingImageRemoval ||
    isCreatingSubcategory ||
    editingSubcategoryId !== null;

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

          subcategoryId:
            formValues.subcategoryId === ""
              ? null
              : Number(formValues.subcategoryId),
          imagePath:
            formValues.imagePath.trim() || null,
          // ENVIO PARA A API
          priceText:
            formValues.priceText.trim() || null,
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
      <div className={styles.itemSubcategories}>
        <div className={styles.itemSubcategoriesHeading}>
          <div>
            <strong>Subcategoria</strong>
            <p>
              Seleciona a subcategoria deste prato.
            </p>
          </div>

          <button
            className={styles.subcategoryAddButton}
            type="button"
            disabled={isFormLocked}
            onClick={() => setIsCreatingSubcategory(true)}
          >
            + Adicionar subcategoria
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

            <span>Sem subcategoria</span>
          </label>

          {availableSubcategories.map((subcategory) => {
            const name =
              subcategory.translations.pt.name ||
              subcategory.translations.es.name ||
              subcategory.translations.en.name ||
              `Subcategoria ${subcategory.position}`;

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
                      formValues.subcategoryId ===
                      String(subcategory.id)
                    }
                    onChange={() =>
                      setFormValues((currentValues) => ({
                        ...currentValues,
                        subcategoryId: String(
                          subcategory.id
                        ),
                      }))
                    }
                  />

                  <span>{name}</span>
                </label>

                <button
                  className={styles.subcategoryEditButton}
                  type="button"
                  disabled={isFormLocked}
                  onClick={() =>
                    setEditingSubcategoryId(
                      subcategory.id
                    )
                  }
                >
                  Editar
                </button>
              </div>
            );
          })}
        </div>

        {editingSubcategoryId !== null && (
          <MenuSubcategoryEditor
            embedded
            subcategory={
              availableSubcategories.find(
                (subcategory) =>
                  subcategory.id ===
                  editingSubcategoryId
              )
            }
            categoryId={categoryId}
            onCancel={() =>
              setEditingSubcategoryId(null)
            }
            onSaved={async (updatedSubcategory) => {
              setAvailableSubcategories(
                (currentSubcategories) =>
                  currentSubcategories.map(
                    (subcategory) =>
                      subcategory.id ===
                        updatedSubcategory.id
                        ? updatedSubcategory
                        : subcategory
                  )
              );

              setEditingSubcategoryId(null);
            }}
            onDeleted={async () => {
              const deletedId =
                editingSubcategoryId;

              setAvailableSubcategories(
                (currentSubcategories) =>
                  currentSubcategories.filter(
                    (subcategory) =>
                      subcategory.id !== deletedId
                  )
              );

              setFormValues((currentValues) => ({
                ...currentValues,
                subcategoryId:
                  currentValues.subcategoryId ===
                    String(deletedId)
                    ? ""
                    : currentValues.subcategoryId,
              }));

              setEditingSubcategoryId(null);
            }}
          />
        )}

        {isCreatingSubcategory && (
          <MenuSubcategoryEditor
            embedded
            subcategory={null}
            categoryId={categoryId}
            onCancel={() =>
              setIsCreatingSubcategory(false)
            }
            onSaved={async (subcategory) => {
              setAvailableSubcategories(
                (currentSubcategories) => [
                  ...currentSubcategories,
                  subcategory,
                ]
              );

              setFormValues((currentValues) => ({
                ...currentValues,
                subcategoryId: String(
                  subcategory.id
                ),
              }));

              setIsCreatingSubcategory(false);
            }}
          />
        )}

        {isCreatingSubcategory && (
          <MenuSubcategoryEditor
            embedded
            subcategory={null}
            categoryId={categoryId}
            onCancel={() =>
              setIsCreatingSubcategory(false)
            }
            onSaved={async (subcategory) => {
              setAvailableSubcategories(
                (currentSubcategories) => [
                  ...currentSubcategories,
                  subcategory,
                ]
              );

              setFormValues((currentValues) => ({
                ...currentValues,
                subcategoryId: String(
                  subcategory.id
                ),
              }));

              setIsCreatingSubcategory(false);
            }}
          />
        )}
        {isCreatingSubcategory && (
          <MenuSubcategoryEditor
            embedded
            subcategory={null}
            categoryId={categoryId}
            onCancel={() =>
              setIsCreatingSubcategory(false)
            }
            onSaved={async (subcategory) => {
              setAvailableSubcategories(
                (currentSubcategories) => [
                  ...currentSubcategories,
                  subcategory,
                ]
              );

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
              setIsConfirmingImageRemoval(true)
            }
          >
            Remover imagem do prato
          </button>
        )}
      </div>
      {isConfirmingImageRemoval && (
        <div
          className={styles.deleteConfirmation}
          role="alert"
        >
          <strong>
            Remover a imagem do prato?
          </strong>

          <p>
            A imagem será removida quando guardares
            o prato.
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
                setIsConfirmingImageRemoval(false)
              }
            >
              Manter imagem
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
              Remover imagem
            </button>
          </div>
        </div>
      )}
      <div className={styles.editorOptions}>
        <label className={styles.priceField}>
          <span>Preço / informação de preço</span>

          <input
            className={styles.editorInput}
            type="text"
            maxLength={200}
            placeholder="Ex.: Meia dose: 8 € · Dose: 14 €"
            disabled={isFormLocked}
            value={formValues.priceText}
            onChange={(event) =>
              setFormValues((currentValues) => ({
                ...currentValues,
                priceText: event.target.value,
              }))
            }
          />

          <small>
            Podes escrever um preço simples ou várias opções.
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