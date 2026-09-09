import { useEffect, useState } from "react";
import styles from "../../styles/Admin.module.css";
import Image from "next/image";
import MenuSubcategoryEditor from "./MenuSubcategoryEditor";
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
  initialFormValues = null,
  onFormValuesChange,
  onCancel,
  onSaved,
  onDeleted,
  onSubcategoriesChanged,
  onSubcategoryCreationFinished,
  startCreatingSubcategory = false,
}) {
  const isCreating = category === null;

  const formIdentifier = isCreating
    ? "new"
    : category.id;

  const [formValues, setFormValues] = useState(
    () => {
      if (isCreating && initialFormValues) {
        return initialFormValues;
      }

      return {
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
      };
    }
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

  const [
    isConfirmingImageRemoval,
    setIsConfirmingImageRemoval,
  ] = useState(false);

  const [
    editingSubcategoryId,
    setEditingSubcategoryId,
  ] = useState(null);

  const [
    isCreatingSubcategory,
    setIsCreatingSubcategory,
  ] = useState(startCreatingSubcategory);

  const [
    movingSubcategoryId,
    setMovingSubcategoryId,
  ] = useState(null);

  const isFormLocked =
    isBusy ||
    isConfirmingDelete ||
    isConfirmingImageRemoval ||
    isCreatingSubcategory ||
    editingSubcategoryId ||
    movingSubcategoryId !== null

  useEffect(() => {
    if (isCreating) {
      onFormValuesChange?.(formValues);
    }
  }, [
    formValues,
    isCreating,
    onFormValuesChange,
  ]);

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
      const response = await adminFetch(
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
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }
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
    event?.preventDefault();
    setErrorMessage("");

    const submitIntent =
      event.nativeEvent?.submitter?.value ?? "save";

    const imagePath =
      formValues.imagePath.trim();

    if (
      imagePath &&
      !isAllowedImagePath(imagePath)
    ) {
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
      const response = await adminFetch(endpoint, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          imagePath: imagePath || null,
          isVisible: formValues.isVisible,
          translations: formValues.translations,
        }),
      }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }
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
      await onSaved(result.category, {
        addSubcategory:
          submitIntent === "add-subcategory",
      });
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
      const response = await adminFetch(
        `/api/admin/menu/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }
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

  async function handleMoveSubcategory(
    subcategoryId,
    direction
  ) {
    setErrorMessage("");
    setMovingSubcategoryId(subcategoryId);

    try {
      const response = await adminFetch(
        "/api/admin/menu/subcategories/order",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            subcategoryId,
            direction,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setIsSubmitting(false);
          return;
        }
        setErrorMessage(
          result.error ??
          "Não foi possível alterar a ordem da subcategoria."
        );
        return;
      }

      if (result.moved) {
        await onSubcategoriesChanged(
          "A ordem das subcategorias foi atualizada."
        );
      }
    } catch {
      setErrorMessage(
        "Não foi possível comunicar com o servidor."
      );
    } finally {
      setMovingSubcategoryId(null);
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

          {!isCreating && isConfirmingDelete && (
            <p>
              {category.translations.pt.label ||
                category.translations.es.label ||
                category.translations.en.label ||
                category.slug}
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
      <div className={styles.categorySubcategories}>
        <div className={styles.categorySubcategoriesHeading}>
          <div>
            <strong>Subcategorias</strong>

            <p>
              Organiza os pratos desta categoria em secções.
            </p>
          </div>

          {!isCreating &&
            !isCreatingSubcategory && (
              <button
                className={styles.subcategoryEditButton}
                type="button"
                disabled={
                  isFormLocked ||
                  editingSubcategoryId !== null
                }
                onClick={() => {
                  setEditingSubcategoryId(null);
                  setIsCreatingSubcategory(true);
                }}
              >
                + Adicionar subcategoria
              </button>
            )}
        </div>

        {isCreating ? (
          <>
            <p>
              As subcategorias são opcionais. Podes
              adicioná-las agora ou mais tarde.
            </p>

            <button
              className={styles.subcategoryEditButton}
              type="submit"
              value="add-subcategory"
              disabled={isFormLocked}
            >
              + Adicionar subcategoria
            </button>
          </>
        ) : (
          <>
            {category.subcategories.length === 0 &&
              !isCreatingSubcategory && (
                <p className={styles.emptyState}>
                  Esta categoria ainda não tem subcategorias.
                </p>
              )}

            {
              category.subcategories.map(
                (subcategory, subcategoryIndex) => {
                  const subcategoryName =
                    subcategory.translations.pt.name ||
                    subcategory.translations.es.name ||
                    subcategory.translations.en.name ||
                    `Subcategoria #${subcategory.position}`;

                  const isEditing =
                    editingSubcategoryId ===
                    subcategory.id;

                  return (
                    <div
                      className={
                        styles.categorySubcategory
                      }
                      key={subcategory.id}
                    >
                      {!isEditing && (
                        <div
                          className={
                            styles.categorySubcategorySummary
                          }
                        >
                          <div
                            className={styles.orderControls}
                            aria-label={`Alterar ordem de ${subcategoryName}`}
                          >
                            <button
                              className={styles.orderButton}
                              type="button"
                              title="Mover subcategoria para cima"
                              aria-label={`Mover ${subcategoryName} para cima`}
                              disabled={
                                subcategoryIndex === 0 ||
                                isFormLocked
                              }
                              onClick={() =>
                                handleMoveSubcategory(
                                  subcategory.id,
                                  "up"
                                )
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
                              title="Mover subcategoria para baixo"
                              aria-label={`Mover ${subcategoryName} para baixo`}
                              disabled={
                                subcategoryIndex ===
                                category.subcategories.length - 1 ||
                                isFormLocked
                              }
                              onClick={() =>
                                handleMoveSubcategory(
                                  subcategory.id,
                                  "down"
                                )
                              }
                            >
                              ↓
                            </button>
                          </div>
                          <div>
                            <strong>
                              {subcategoryName}
                            </strong>

                            <span>
                              {subcategory.isVisible
                                ? "Visível"
                                : "Oculta"}
                            </span>
                          </div>

                          <button
                            className={
                              styles.subcategoryEditButton
                            }
                            type="button"
                            disabled={
                              isFormLocked ||
                              isCreatingSubcategory ||
                              editingSubcategoryId !==
                              null
                            }
                            onClick={() =>
                              setEditingSubcategoryId(
                                subcategory.id
                              )
                            }
                          >
                            Editar
                          </button>
                        </div>
                      )}

                      {isEditing && (
                        <MenuSubcategoryEditor
                          embedded
                          subcategory={subcategory}
                          categoryId={category.id}
                          onCancel={() =>
                            setEditingSubcategoryId(null)
                          }
                          onSaved={async () => {
                            setEditingSubcategoryId(null);

                            await onSubcategoriesChanged(
                              "A subcategoria foi atualizada com sucesso."
                            );
                          }}
                          onDeleted={async () => {
                            setEditingSubcategoryId(null);

                            await onSubcategoriesChanged(
                              "A subcategoria foi eliminada com sucesso."
                            );
                          }}
                        />
                      )}
                    </div>
                  );
                }
              )}

            {isCreatingSubcategory && (
              <MenuSubcategoryEditor
                embedded
                subcategory={null}
                categoryId={category.id}
                onCancel={() => {
                  setIsCreatingSubcategory(false);
                  onSubcategoryCreationFinished?.();
                }}
                onSaved={async () => {
                  setIsCreatingSubcategory(false);

                  onSubcategoryCreationFinished?.();

                  await onSubcategoriesChanged(
                    "A nova subcategoria foi criada com sucesso."
                  );
                }}
              />
            )}
          </>
        )}
      </div>
      <div className={styles.imageUploadField}>
        <span className={styles.editorField}>
          Imagem da categoria
        </span>

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
              alt="Pré-visualização da categoria"
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
            Remover imagem da categoria
          </button>
        )}
      </div>
      {isConfirmingImageRemoval && (
        <div
          className={styles.deleteConfirmation}
          role="alert"
        >
          <strong>
            Remover a imagem da categoria?
          </strong>

          <p>
            A imagem será removida quando guardares
            a categoria.
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

        <span>Categoria visível no site público</span>
      </label>
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
              disabled={isBusy}
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
            disabled={isFormLocked}
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
          value="save"
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
