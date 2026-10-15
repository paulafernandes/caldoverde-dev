import { Fragment, useEffect, useRef, useState } from "react";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { adminFetch } from "../../lib/adminFetch";
import { getAdminApiErrorKey } from "../../lib/adminApiError";
import { getBusinessLanguageOption } from "../../utils/businessLanguages";
import styles from "../../styles/Admin.module.css";

const CONFIRMATION_ID = "business-languages-confirmation";
const DEFAULT_CONFIRMATION_ID = "business-default-language-confirmation";
const FINISH_BLOCKED_NOTE_ID = "business-languages-finish-blocked";
const DEFAULT_RADIO_NAME = "business-default-language";
const COLUMN_COUNT = 4;

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
  const [isEditing, setIsEditing] = useState(false);
  const [candidateDefault, setCandidateDefault] = useState(null);
  const [activatedLanguage, setActivatedLanguage] = useState(null);
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const checkboxRefs = useRef({});
  const radioRefs = useRef({});
  const orderButtonRefs = useRef({});
  const cancelButtonRef = useRef(null);
  const editButtonRef = useRef(null);
  const finishButtonRef = useRef(null);
  const tableRef = useRef(null);

  // Só na confirmação de desativar: na do predefinido o foco fica no radio,
  // para as setas continuarem a mudar de idioma.
  useEffect(() => {
    if (pendingLanguage) {
      cancelButtonRef.current?.focus();
    }
  }, [pendingLanguage]);

  function getLabel(language) {
    return getBusinessLanguageOption(language).label;
  }

  function getLabelByCode(code) {
    return getLabel(
      languages.find(({ language }) => language === code) ?? {
        language: code,
        locale: "",
      }
    );
  }

  function focusCheckbox(code) {
    window.requestAnimationFrame(() => checkboxRefs.current[code]?.focus());
  }

  function focusRadio(code) {
    window.requestAnimationFrame(() => radioRefs.current[code]?.focus());
  }

  function handleEdit() {
    setFormError("");
    setStatusMessage({ key: "settings.languages.editingStarted" });
    setIsEditing(true);

    window.requestAnimationFrame(() =>
      tableRef.current
        ?.querySelector("button:not(:disabled), input:not(:disabled)")
        ?.focus()
    );
  }

  function handleFinishEditing() {
    if (isSaving || pendingLanguage || candidateDefault) {
      return;
    }

    setFormError("");
    setStatusMessage(null);
    setActivatedLanguage(null);
    setIsEditing(false);
    window.requestAnimationFrame(() => editButtonRef.current?.focus());
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

    setCandidateDefault(null);
    setActivatedLanguage(null);

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

  // Escolher um radio só abre (ou atualiza) a confirmação; nada é gravado.
  function handleDefaultRadioChange(code) {
    if (isSaving) {
      return;
    }

    setPendingLanguage(null);
    setFormError("");
    setStatusMessage(null);
    setActivatedLanguage(null);
    setCandidateDefault(code === defaultLanguage ? null : code);
  }

  function handleDefaultCancel() {
    setCandidateDefault(null);
    setActivatedLanguage(null);
    setFormError("");
    focusRadio(defaultLanguage);
  }

  // Inativo: primeiro ativa, depois muda o predefinido, para que cada estado
  // intermédio seja válido no servidor. Calculado do estado atual, por isso
  // repetir depois de uma falha no 2.º pedido só faz esse pedido.
  async function saveDefaultLanguage() {
    if (isSaving || isSessionExpired || !candidateDefault) {
      return;
    }

    const candidate = languages.find(
      ({ language }) => language === candidateDefault
    );

    if (!candidate) {
      return;
    }

    const label = getLabel(candidate);
    const needsActivation = !candidate.isEnabled;

    setFormError("");
    setStatusMessage(null);
    setIsSaving(true);

    try {
      if (needsActivation) {
        const activation = await requestLanguageUpdate(candidate, true);

        if (activation.status === "expired") {
          return;
        }

        if (activation.status !== "saved") {
          setFormError(activation.errorKey);
          return;
        }

        setLanguages(activation.languages);
        setActivatedLanguage(candidate.language);
      }

      const result = await requestDefaultLanguageUpdate(candidate.language);

      // A reautenticação aparece na página; a confirmação pendente mantém-se.
      if (result.status === "expired") {
        return;
      }

      if (result.status !== "saved") {
        setFormError(result.errorKey);
        return;
      }

      const wasActivated =
        needsActivation || activatedLanguage === candidate.language;

      setLanguages(result.languages);
      setDefaultLanguage(result.defaultLanguage);
      setCandidateDefault(null);
      setActivatedLanguage(null);
      setStatusMessage({
        key: wasActivated
          ? "settings.languages.defaultChangedActivated"
          : "settings.languages.defaultChanged",
        language: label,
      });
      focusRadio(result.defaultLanguage);
    } catch {
      setFormError("settings.languages.defaultSaveFailed");
    } finally {
      setIsSaving(false);
    }
  }

  const defaultLanguageLabel = getLabelByCode(defaultLanguage);
  const candidateLanguage = languages.find(
    ({ language }) => language === candidateDefault
  );
  const candidateLabel = candidateLanguage ? getLabel(candidateLanguage) : "";
  const candidateNeedsActivation = Boolean(
    candidateLanguage && !candidateLanguage.isEnabled
  );
  const isConfirmationOpen = Boolean(pendingLanguage || candidateLanguage);

  function renderDefaultConfirmation() {
    const params = {
      code: candidateDefault,
      language: candidateLabel,
      previousLanguage: defaultLanguageLabel,
      defaultLanguage: defaultLanguageLabel,
    };

    return (
      <div
        id={DEFAULT_CONFIRMATION_ID}
        className={styles.deleteConfirmation}
        role="alert"
      >
        <strong>
          {t(
            candidateNeedsActivation
              ? "settings.languages.defaultActivateQuestion"
              : "settings.languages.defaultQuestion",
            params
          )}
        </strong>
        <p>
          {t(
            candidateNeedsActivation
              ? "settings.languages.defaultActivateDescription"
              : "settings.languages.defaultDescription",
            params
          )}
        </p>

        {formError && activatedLanguage === candidateDefault && (
          <p>{t("settings.languages.defaultActivatedButNotDefault", params)}</p>
        )}
        {formError && <p>{t(formError)}</p>}

        <div className={styles.deleteConfirmationActions}>
          <button
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
              : t(
                  candidateNeedsActivation
                    ? "settings.languages.confirmActivateDefault"
                    : "settings.languages.confirmDefault"
                )}
          </button>
        </div>
      </div>
    );
  }

  function renderDisableConfirmation() {
    return (
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
            language: getLabel(pendingLanguage),
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
    );
  }

  return (
    <section
      className={`${styles.userFormCard} ${styles.settingsFormCard}`}
      aria-labelledby="business-languages-title"
    >
      <div className={styles.settingsCardHeader}>
        <h2 id="business-languages-title">{t("settings.languages.title")}</h2>

        {isEditing ? (
          <button
            ref={finishButtonRef}
            type="button"
            className={styles.editButton}
            disabled={isSaving || isConfirmationOpen}
            aria-describedby={
              isConfirmationOpen ? FINISH_BLOCKED_NOTE_ID : undefined
            }
            onClick={handleFinishEditing}
          >
            {t("settings.languages.finishEditing")}
          </button>
        ) : (
          <button
            ref={editButtonRef}
            type="button"
            className={styles.editButton}
            onClick={handleEdit}
          >
            {t("settings.edit")}
          </button>
        )}
      </div>

      <p className={styles.openingHoursNote}>
        {t("settings.languages.description")}
      </p>

      {isEditing && isConfirmationOpen && (
        <p id={FINISH_BLOCKED_NOTE_ID} className={styles.openingHoursNote}>
          {t("settings.languages.finishEditingBlocked")}
        </p>
      )}

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

      <table ref={tableRef} className={styles.openingHoursTable}>
        <caption className={styles.openingHoursVisuallyHidden}>
          {t("settings.languages.caption")}
        </caption>

        <thead>
          <tr>
            <th scope="col">{t("settings.languages.columnOrder")}</th>
            <th scope="col">{t("settings.languages.columnLanguage")}</th>
            <th scope="col">{t("settings.languages.columnEnabled")}</th>
            <th scope="col">{t("settings.languages.columnDefault")}</th>
          </tr>
        </thead>

        <tbody>
          {languages.map((language, index) => {
            const { code, label, flag } = getBusinessLanguageOption(language);
            const isDefault = code === defaultLanguage;
            const hasSiteTexts = siteLanguages.includes(code);
            const isPending = pendingLanguage?.language === code;
            const isCandidate = candidateLanguage?.language === code;
            const noteId = `business-language-${code}-note`;

            // Predefinido: nunca se desativa. Sem textos do site: não se ativa.
            const isLocked =
              isDefault || (!language.isEnabled && !hasSiteTexts);

            let note = "";

            if (!hasSiteTexts) {
              note = t("settings.languages.noSiteTexts");
            } else if (isDefault && isEditing) {
              note = t("settings.languages.defaultCannotBeDisabled");
            }

            return (
              <Fragment key={code}>
                <tr
                  className={
                    isPending || isCandidate
                      ? styles.openingHoursActiveRow
                      : undefined
                  }
                >
                  <td>
                    <div className={styles.languageOrderCell}>
                      <span>{index + 1}</span>

                      {isEditing && (
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
                                  orderButtonRefs.current[
                                    `${code}-${direction}`
                                  ] = element;
                                }}
                                type="button"
                                className={styles.orderButton}
                                title={buttonLabel}
                                aria-label={buttonLabel}
                                disabled={isAtEdge || isSaving}
                                onClick={() =>
                                  moveLanguage(language, direction)
                                }
                              >
                                <span aria-hidden="true">
                                  {direction === "up" ? "↑" : "↓"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>

                  <th scope="row">
                    <span aria-hidden="true">{flag}</span> {label}{" "}
                    <span className={styles.openingHoursNote}>({code})</span>
                    {note && (
                      <span id={noteId} className={styles.openingHoursNote}>
                        <br />
                        {note}
                      </span>
                    )}
                  </th>

                  <td className={styles.openingHoursCheckboxCell}>
                    {isEditing ? (
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
                        aria-describedby={
                          note && (isDefault || !hasSiteTexts)
                            ? noteId
                            : undefined
                        }
                        aria-controls={isPending ? CONFIRMATION_ID : undefined}
                        onChange={(event) =>
                          handleEnabledChange(language, event.target.checked)
                        }
                      />
                    ) : language.isEnabled ? (
                      t("settings.languages.yes")
                    ) : (
                      t("settings.languages.no")
                    )}
                  </td>

                  <td className={styles.openingHoursCheckboxCell}>
                    <div className={styles.languageDefaultCell}>
                      {isEditing && (
                        <input
                          ref={(element) => {
                            radioRefs.current[code] = element;
                          }}
                          type="radio"
                          name={DEFAULT_RADIO_NAME}
                          value={code}
                          checked={
                            code === (candidateDefault ?? defaultLanguage)
                          }
                          disabled={!hasSiteTexts || isSaving}
                          aria-label={t("settings.languages.makeDefaultLabel", {
                            language: label,
                          })}
                          aria-describedby={!hasSiteTexts ? noteId : undefined}
                          aria-controls={
                            isCandidate ? DEFAULT_CONFIRMATION_ID : undefined
                          }
                          onChange={() => handleDefaultRadioChange(code)}
                        />
                      )}

                      {isDefault && (
                        <span className={styles.statusVisible}>
                          {t("settings.languages.statusDefault")}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>

                {isEditing && (isPending || isCandidate) && (
                  <tr>
                    <td colSpan={COLUMN_COUNT}>
                      {isPending
                        ? renderDisableConfirmation()
                        : renderDefaultConfirmation()}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {formError && !isConfirmationOpen && (
        <p className={styles.error} role="alert">
          {t(formError)}
        </p>
      )}
    </section>
  );
}
