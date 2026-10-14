import { useEffect, useRef, useState } from "react";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { adminFetch } from "../../lib/adminFetch";
import { getAdminApiErrorKey } from "../../lib/adminApiError";
import { getBusinessLanguageOption } from "../../utils/businessLanguages";
import styles from "../../styles/Admin.module.css";

const CONFIRMATION_ID = "business-languages-confirmation";

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

export default function BusinessLanguagesEditor({
  initialLanguages,
  defaultLanguage,
  siteLanguages,
  isSessionExpired,
}) {
  const { t } = useAdminLanguage();

  const [languages, setLanguages] = useState(initialLanguages ?? []);
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const checkboxRefs = useRef({});
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (pendingLanguage) {
      cancelButtonRef.current?.focus();
    }
  }, [pendingLanguage]);

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
    setPendingLanguage(language);
  }

  function handleCancel() {
    const code = pendingLanguage.language;

    setPendingLanguage(null);
    setFormError("");
    focusCheckbox(code);
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
        {statusMessage &&
          t(statusMessage.key, { language: statusMessage.language })}
      </p>

      <table className={styles.openingHoursTable}>
        <caption className={styles.openingHoursVisuallyHidden}>
          {t("settings.languages.caption")}
        </caption>

        <thead>
          <tr>
            <th scope="col">{t("settings.languages.columnEnabled")}</th>
            <th scope="col">{t("settings.languages.columnLanguage")}</th>
            <th scope="col">{t("settings.languages.columnStatus")}</th>
          </tr>
        </thead>

        <tbody>
          {languages.map((language) => {
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

      {formError && !pendingLanguage && (
        <p className={styles.error} role="alert">
          {t(formError)}
        </p>
      )}
    </section>
  );
}
