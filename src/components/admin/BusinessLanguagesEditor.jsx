import { useEffect, useRef, useState } from "react";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { adminFetch } from "../../lib/adminFetch";
import { getAdminApiErrorKey } from "../../lib/adminApiError";
import { getBusinessLanguageOption } from "../../utils/businessLanguages";
import styles from "../../styles/Admin.module.css";

const CONFIRMATION_ID = "business-languages-confirmation";
const DEFAULT_CONFIRMATION_ID = "business-default-language-confirmation";
const DEFAULT_SELECT_ID = "business-default-language";

// O PATCH exige o locale: reenvia o atual, só muda o estado.
async function requestLanguageUpdate({ language, locale }, isEnabled) {
  const response = await adminFetch(
    `/api/admin/business/languages/${encodeURIComponent(language)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locale, isEnabled }),
    }
  );

  // A reautenticação aparece na página; a confirmação pendente mantém-se.
  if (response.status === 401) {
    return { status: "expired" };
  }

  const data = await response.json();

  if (response.ok) {
    return { status: "saved", languages: data.settings.languages ?? [] };
  }

  return {
    status: "failed",
    errorKey: getAdminApiErrorKey(data.error, "settings.languages.saveFailed"),
  };
}

async function requestLanguageMove(language, direction) {
  const response = await adminFetch("/api/admin/business/languages/order", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ language, direction }),
  });

  if (response.status === 401) {
    return { status: "expired" };
  }

  const data = await response.json().catch(() => ({}));

  if (response.ok && data.result) {
    return { status: "moved", result: data.result };
  }

  return {
    status: "failed",
    errorKey: getAdminApiErrorKey(data.error, "settings.languages.orderFailed"),
  };
}

async function requestDefaultLanguageUpdate(language) {
  const response = await adminFetch("/api/admin/business/default-language", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ language }),
  });

  if (response.status === 401) {
    return { status: "expired" };
  }

  const data = await response.json().catch(() => ({}));

  if (response.ok && data.settings) {
    return {
      status: "saved",
      languages: data.settings.languages ?? [],
      defaultLanguage: data.settings.defaultLanguage,
    };
  }

  return {
    status: "failed",
    errorKey: getAdminApiErrorKey(
      data.error,
      "settings.languages.defaultSaveFailed"
    ),
  };
}

export default function BusinessLanguagesEditor({
  initialLanguages,
  initialDefaultLanguage,
  siteLanguages,
  isSessionExpired,
}) {
  const { t } = useAdminLanguage();

  const [languages, setLanguages] = useState(initialLanguages ?? []);
  const [defaultLanguage, setDefaultLanguage] = useState(
    initialDefaultLanguage
  );
  const [selectedDefaultLanguage, setSelectedDefaultLanguage] = useState(
    initialDefaultLanguage
  );
  const [isDefaultConfirmationOpen, setIsDefaultConfirmationOpen] =
    useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const checkboxRefs = useRef({});
  const orderButtonRefs = useRef({});
  const cancelButtonRef = useRef(null);
  const defaultSelectRef = useRef(null);

  // Só há uma confirmação aberta de cada vez: o ref serve às duas.
  useEffect(() => {
    if (pendingLanguage || isDefaultConfirmationOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [pendingLanguage, isDefaultConfirmationOpen]);

  function getLabel(language) {
    return getBusinessLanguageOption(language).label;
  }

  function focusCheckbox(code) {
    window.requestAnimationFrame(() => checkboxRefs.current[code]?.focus());
  }

  async function saveLanguage(language, isEnabled) {
    setFormError("");
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const result = await requestLanguageUpdate(language, isEnabled);

      if (result.status === "expired") {
        return;
      }

      if (result.status !== "saved") {
        setFormError(result.errorKey);
        return;
      }

      setLanguages(result.languages);
      setPendingLanguage(null);
      setStatusMessage({
        key: isEnabled
          ? "settings.languages.enabled"
          : "settings.languages.disabled",
        language: getLabel(language),
      });
      focusCheckbox(language.language);
    } catch {
      setFormError("settings.languages.saveFailed");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEnabledChange(language, isEnabled) {
    if (isSaving || isSessionExpired) {
      return;
    }

    if (isEnabled) {
      setPendingLanguage(null);
      saveLanguage(language, true);
      return;
    }

    // Desativar muda logo o site público: pede confirmação primeiro.
    setFormError("");
    setStatusMessage(null);
    setIsDefaultConfirmationOpen(false);
    setPendingLanguage(language);
  }

  // O botão focado fica desativado durante o pedido e perde o foco.
  // No extremo da lista, o botão da mesma direção continua desativado.
  function focusOrderButton(code, direction, index, total) {
    const isAtEdge = direction === "up" ? index === 0 : index === total - 1;
    const targetDirection = isAtEdge
      ? direction === "up"
        ? "down"
        : "up"
      : direction;

    window.requestAnimationFrame(() =>
      orderButtonRefs.current[`${code}-${targetDirection}`]?.focus()
    );
  }

  async function moveLanguage(language, direction) {
    if (isSaving || isSessionExpired) {
      return;
    }

    const code = language.language;
    const index = languages.findIndex((entry) => entry.language === code);
    // Vizinho na lista completa, incluindo desativados, como no serviço.
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    const neighbor = languages[neighborIndex];

    if (index === -1 || !neighbor) {
      return;
    }

    setFormError("");
    setStatusMessage(null);
    setIsSaving(true);

    let focusIndex = index;

    try {
      const response = await requestLanguageMove(code, direction);

      if (response.status === "expired") {
        return;
      }

      if (response.status !== "moved") {
        setFormError(response.errorKey);
        return;
      }

      // Só troca no ecrã se a BD trocou com o mesmo vizinho.
      const { moved, position } = response.result;

      if (!moved || position !== neighbor.position) {
        setFormError("settings.languages.orderOutOfSync");
        return;
      }

      const nextLanguages = [...languages];
      nextLanguages[index] = { ...neighbor, position: language.position };
      nextLanguages[neighborIndex] = { ...language, position };

      setLanguages(nextLanguages);
      setStatusMessage({
        key: "settings.languages.moved",
        language: getLabel(language),
        position: neighborIndex + 1,
        total: nextLanguages.length,
      });
      focusIndex = neighborIndex;
    } catch {
      setFormError("settings.languages.orderFailed");
    } finally {
      setIsSaving(false);
      focusOrderButton(code, direction, focusIndex, languages.length);
    }
  }

  function handleCancel() {
    const code = pendingLanguage.language;

    setPendingLanguage(null);
    setFormError("");
    focusCheckbox(code);
  }

  function focusDefaultSelect() {
    window.requestAnimationFrame(() => defaultSelectRef.current?.focus());
  }

  // Só idiomas ativos e com textos do site podem ser predefinidos.
  const defaultOptions = languages.filter(
    ({ language, isEnabled }) => isEnabled && siteLanguages.includes(language)
  );

  // Se o idioma escolhido deixou de ser opção, volta ao predefinido.
  const selectedDefault = defaultOptions.some(
    ({ language }) => language === selectedDefaultLanguage
  )
    ? selectedDefaultLanguage
    : defaultLanguage;

  const selectedDefaultLabel = getLabel(
    languages.find(({ language }) => language === selectedDefault) ?? {
      language: selectedDefault,
      locale: "",
    }
  );

  function handleDefaultSelectChange(language) {
    setSelectedDefaultLanguage(language);
    setIsDefaultConfirmationOpen(false);
    setFormError("");
    setStatusMessage(null);
  }

  function handleDefaultSaveClick() {
    if (isSaving || isSessionExpired || selectedDefault === defaultLanguage) {
      return;
    }

    // Mudar o predefinido muda logo o site público: pede confirmação primeiro.
    setFormError("");
    setStatusMessage(null);
    setPendingLanguage(null);
    setIsDefaultConfirmationOpen(true);
  }

  function handleDefaultCancel() {
    setIsDefaultConfirmationOpen(false);
    setSelectedDefaultLanguage(defaultLanguage);
    setFormError("");
    focusDefaultSelect();
  }

  async function saveDefaultLanguage() {
    setFormError("");
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const result = await requestDefaultLanguageUpdate(selectedDefault);

      // A reautenticação aparece na página; a confirmação pendente mantém-se.
      if (result.status === "expired") {
        return;
      }

      if (result.status !== "saved") {
        setFormError(result.errorKey);
        return;
      }

      setLanguages(result.languages);
      setDefaultLanguage(result.defaultLanguage);
      setSelectedDefaultLanguage(result.defaultLanguage);
      setIsDefaultConfirmationOpen(false);
      setStatusMessage({
        key: "settings.languages.defaultChanged",
        language: selectedDefaultLabel,
      });
      focusDefaultSelect();
    } catch {
      setFormError("settings.languages.defaultSaveFailed");
    } finally {
      setIsSaving(false);
    }
  }

  const defaultLanguageLabel = getLabel(
    languages.find(({ language }) => language === defaultLanguage) ?? {
      language: defaultLanguage,
      locale: "",
    }
  );

  return (
    <section
      className={`${styles.userFormCard} ${styles.settingsFormCard}`}
      aria-labelledby="business-languages-title"
    >
      <div className={styles.settingsCardHeader}>
        <h2 id="business-languages-title">{t("settings.languages.title")}</h2>
      </div>

      <p className={styles.openingHoursNote}>
        {t("settings.languages.description")}
      </p>

      <p
        className={
          statusMessage
            ? `${styles.successMessage} ${styles.openingHoursStatus}`
            : undefined
        }
        role="status"
      >
        {statusMessage && t(statusMessage.key, statusMessage)}
      </p>

      <table className={styles.openingHoursTable}>
        <caption className={styles.openingHoursVisuallyHidden}>
          {t("settings.languages.caption")}
        </caption>

        <thead>
          <tr>
            <th scope="col">{t("settings.languages.columnOrder")}</th>
            <th scope="col">{t("settings.languages.columnEnabled")}</th>
            <th scope="col">{t("settings.languages.columnLanguage")}</th>
            <th scope="col">{t("settings.languages.columnStatus")}</th>
          </tr>
        </thead>

        <tbody>
          {languages.map((language, index) => {
            const { code, label, flag } = getBusinessLanguageOption(language);
            const isDefault = code === defaultLanguage;
            const hasSiteTexts = siteLanguages.includes(code);
            const isPending = pendingLanguage?.language === code;
            const noteId = `business-language-${code}-note`;

            // Predefinido: nunca se desativa. Sem textos do site: não se ativa.
            const isLocked =
              isDefault || (!language.isEnabled && !hasSiteTexts);

            let note = "";

            if (isDefault) {
              note = t("settings.languages.defaultCannotBeDisabled");
            } else if (!hasSiteTexts) {
              note = t("settings.languages.noSiteTexts");
            }

            return (
              <tr
                key={code}
                className={isPending ? styles.openingHoursActiveRow : undefined}
              >
                <td>
                  <div className={styles.orderControls}>
                    {["up", "down"].map((direction) => {
                      const buttonLabel = t(
                        direction === "up"
                          ? "settings.languages.moveUp"
                          : "settings.languages.moveDown",
                        { language: label }
                      );
                      const isAtEdge =
                        direction === "up"
                          ? index === 0
                          : index === languages.length - 1;

                      return (
                        <button
                          key={direction}
                          ref={(element) => {
                            orderButtonRefs.current[`${code}-${direction}`] =
                              element;
                          }}
                          type="button"
                          className={styles.orderButton}
                          title={buttonLabel}
                          aria-label={buttonLabel}
                          disabled={isAtEdge || isSaving}
                          onClick={() => moveLanguage(language, direction)}
                        >
                          <span aria-hidden="true">
                            {direction === "up" ? "↑" : "↓"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </td>

                <td className={styles.openingHoursCheckboxCell}>
                  <input
                    ref={(element) => {
                      checkboxRefs.current[code] = element;
                    }}
                    type="checkbox"
                    checked={language.isEnabled && !isPending}
                    disabled={isLocked || isSaving}
                    aria-label={t("settings.languages.enabledLabel", {
                      language: label,
                    })}
                    aria-describedby={note ? noteId : undefined}
                    aria-controls={isPending ? CONFIRMATION_ID : undefined}
                    onChange={(event) =>
                      handleEnabledChange(language, event.target.checked)
                    }
                  />
                </td>

                <th scope="row">
                  <span aria-hidden="true">{flag}</span> {label}{" "}
                  <span className={styles.openingHoursNote}>({code})</span>
                </th>

                <td>
                  {isDefault
                    ? t("settings.languages.statusDefault")
                    : language.isEnabled
                      ? t("settings.languages.statusEnabled")
                      : t("settings.languages.statusDisabled")}

                  {note && (
                    <span id={noteId} className={styles.openingHoursNote}>
                      <br />
                      {note}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.field}>
        <label htmlFor={DEFAULT_SELECT_ID}>
          {t("settings.languages.defaultLabel")}
        </label>
        <select
          ref={defaultSelectRef}
          id={DEFAULT_SELECT_ID}
          value={selectedDefault}
          disabled={isSaving}
          aria-controls={
            isDefaultConfirmationOpen ? DEFAULT_CONFIRMATION_ID : undefined
          }
          onChange={(event) => handleDefaultSelectChange(event.target.value)}
        >
          {defaultOptions.map((language) => {
            const { code, label } = getBusinessLanguageOption(language);

            return (
              <option key={code} value={code}>
                {label} ({code})
              </option>
            );
          })}
        </select>
      </div>

      <div className={styles.userFormActions}>
        <button
          type="button"
          className={styles.button}
          disabled={
            selectedDefault === defaultLanguage || isSaving || isSessionExpired
          }
          onClick={handleDefaultSaveClick}
        >
          {t("settings.save")}
        </button>
      </div>

      {isDefaultConfirmationOpen && (
        <div
          id={DEFAULT_CONFIRMATION_ID}
          className={styles.deleteConfirmation}
          role="alert"
        >
          <strong>
            {t("settings.languages.defaultQuestion", {
              language: selectedDefaultLabel,
            })}
          </strong>
          <p>
            {t("settings.languages.defaultDescription", {
              code: selectedDefault,
              language: selectedDefaultLabel,
            })}
          </p>

          {formError && <p>{t(formError)}</p>}

          <div className={styles.deleteConfirmationActions}>
            <button
              ref={cancelButtonRef}
              type="button"
              className={styles.cancelButton}
              disabled={isSaving}
              onClick={handleDefaultCancel}
            >
              {t("settings.languages.keepDefault")}
            </button>

            <button
              type="button"
              className={styles.confirmDeleteButton}
              disabled={isSaving || isSessionExpired}
              onClick={saveDefaultLanguage}
            >
              {isSaving
                ? t("settings.saving")
                : t("settings.languages.confirmDefault")}
            </button>
          </div>
        </div>
      )}

      {pendingLanguage && (
        <div
          id={CONFIRMATION_ID}
          className={styles.deleteConfirmation}
          role="alert"
        >
          <strong>
            {t("settings.languages.disableQuestion", {
              language: getLabel(pendingLanguage),
            })}
          </strong>
          <p>
            {t("settings.languages.disableDescription", {
              code: pendingLanguage.language,
              defaultLanguage: defaultLanguageLabel,
            })}
          </p>

          {formError && <p>{t(formError)}</p>}

          <div className={styles.deleteConfirmationActions}>
            <button
              ref={cancelButtonRef}
              type="button"
              className={styles.cancelButton}
              disabled={isSaving}
              onClick={handleCancel}
            >
              {t("settings.languages.keepEnabled")}
            </button>

            <button
              type="button"
              className={styles.confirmDeleteButton}
              disabled={isSaving || isSessionExpired}
              onClick={() => saveLanguage(pendingLanguage, false)}
            >
              {isSaving
                ? t("settings.saving")
                : t("settings.languages.confirmDisable")}
            </button>
          </div>
        </div>
      )}

      {formError && !pendingLanguage && !isDefaultConfirmationOpen && (
        <p className={styles.error} role="alert">
          {t(formError)}
        </p>
      )}
    </section>
  );
}
