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

export default function MenuItemEditor({
  item,
  onCancel,
  onSaved,
}) {
  const [formValues, setFormValues] = useState(
    () => ({
      price: formatPriceInput(item.priceCents),
      isVisible: item.isVisible,
      translations: {
        pt: { ...item.translations.pt },
        es: { ...item.translations.es },
        en: { ...item.translations.en },
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

    const parsedPrice = parsePriceInput(
      formValues.price
    );

    if (parsedPrice.error) {
      setErrorMessage(parsedPrice.error);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/menu/items/${item.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            priceCents: parsedPrice.value,
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
            "Não foi possível guardar o prato."
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
          <h3>
            Editar prato #{item.position}
          </h3>

          <p>
            Altera os textos, o preço ou a
            visibilidade.
          </p>
        </div>
      </div>

      <div
        className={styles.translationEditorList}
      >
        {languages.map((language) => {
          const translation =
            formValues.translations[language.code];

          const nameId =
            `item-${item.id}-${language.code}-name`;

          const descriptionId =
            `item-${item.id}-${language.code}-description`;

          return (
            <fieldset
              className={styles.translationEditor}
              key={language.code}
              disabled={isSubmitting}
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
                required
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
                required
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

      <div className={styles.editorOptions}>
        <label className={styles.priceField}>
          <span>Preço em euros</span>

          <input
            className={styles.editorInput}
            type="text"
            inputMode="decimal"
            placeholder="Ex.: 12,50"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            : "Guardar alterações"}
        </button>
      </div>
    </form>
  );
}
