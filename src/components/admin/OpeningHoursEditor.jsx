import { Fragment, useEffect, useRef, useState } from "react";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { adminFetch } from "../../lib/adminFetch";
import {
  DAYS_OF_WEEK,
  findOverlappingOpeningHours,
  groupOpeningHoursByDay,
  isValidOpeningHourTime,
  normalizeTimeInput,
} from "../../utils/openingHours";
import styles from "../../styles/Admin.module.css";

// Limite só da interface; o modelo e a API aceitam mais intervalos por dia.
const MAX_INTERVALS_IN_FORM = 2;

const EMPTY_INTERVAL = { opensAt: "", closesAt: "" };

const NO_ERRORS = { fields: {}, conflicts: {} };

const PANEL_ID = "opening-hours-panel";

const ERROR_MESSAGES = {
  INVALID_TIME_FORMAT: "settings.openingHours.invalidTimeFormat",
  SAME_OPEN_CLOSE_TIME: "settings.openingHours.sameOpenCloseTime",
  TOO_MANY_OPENING_HOURS: "settings.openingHours.tooMany",
  INVALID_DAY_OF_WEEK: "settings.openingHours.invalidDay",
};

function formatInterval({ opensAt, closesAt }) {
  return `${opensAt}–${closesAt}`;
}

function haveSameIntervals(first, second) {
  return (
    first.length === second.length &&
    first.every(
      (interval, index) =>
        interval.opensAt === second[index].opensAt &&
        interval.closesAt === second[index].closesAt
    )
  );
}

// Semana enviada à API: o rascunho no dia editado e nos dias copiados, o
// horário gravado nos restantes. Para cada posição, o dia e o intervalo de origem.
function toOpeningHoursPayload(savedDays, draftDays, draftIntervals) {
  const openingHours = [];
  const sources = [];

  for (const { dayOfWeek, intervals } of savedDays) {
    const fromDraft = draftDays.includes(dayOfWeek);

    (fromDraft ? draftIntervals : intervals).forEach(
      (interval, intervalIndex) => {
        openingHours.push({
          dayOfWeek,
          opensAt: interval.opensAt.trim(),
          closesAt: interval.closesAt.trim(),
        });

        sources.push({ dayOfWeek, intervalIndex, fromDraft });
      }
    );
  }

  return { openingHours, sources };
}

function getFieldKey(intervalIndex, field) {
  return `${intervalIndex}-${field}`;
}

function getFieldId(intervalIndex, field) {
  return `opening-hours-${getFieldKey(intervalIndex, field)}`;
}

function getConflictId(intervalIndex) {
  return `opening-hours-interval-${intervalIndex}-error`;
}

function validateDraftIntervals(draftIntervals) {
  const errors = {};

  draftIntervals.forEach((interval, intervalIndex) => {
    const opensAt = interval.opensAt.trim();
    const closesAt = interval.closesAt.trim();

    for (const [field, value] of [
      ["opensAt", opensAt],
      ["closesAt", closesAt],
    ]) {
      if (!isValidOpeningHourTime(value)) {
        errors[getFieldKey(intervalIndex, field)] = "INVALID_TIME_FORMAT";
      }
    }

    if (
      !errors[getFieldKey(intervalIndex, "opensAt")] &&
      !errors[getFieldKey(intervalIndex, "closesAt")] &&
      opensAt === closesAt
    ) {
      errors[getFieldKey(intervalIndex, "closesAt")] = "SAME_OPEN_CLOSE_TIME";
    }
  });

  return errors;
}

// Para cada intervalo do rascunho, o primeiro conflito encontrado, para indicar
// no painel com que dia colide (mesmo dia, dia vizinho ou dia copiado).
function findDraftConflicts(openingHours, sources, editedDayOfWeek) {
  const overlappingIndexes = findOverlappingOpeningHours(openingHours);
  const conflicts = {};

  const isCopied = (source) =>
    source.fromDraft && source.dayOfWeek !== editedDayOfWeek;

  for (const firstIndex of overlappingIndexes) {
    for (const secondIndex of overlappingIndexes) {
      const first = sources[firstIndex];
      const second = sources[secondIndex];

      if (
        firstIndex >= secondIndex ||
        (!first.fromDraft && !second.fromDraft) ||
        findOverlappingOpeningHours([
          openingHours[firstIndex],
          openingHours[secondIndex],
        ]).length === 0
      ) {
        continue;
      }

      if (
        first.fromDraft &&
        second.fromDraft &&
        first.dayOfWeek === second.dayOfWeek
      ) {
        // Num dia copiado, o mesmo conflito já aparece no dia editado.
        if (first.dayOfWeek === editedDayOfWeek) {
          for (const source of [first, second]) {
            conflicts[source.intervalIndex] ??= { key: "overlapSameDay" };
          }
        }

        continue;
      }

      if (isCopied(first) || isCopied(second)) {
        const [copied, other, otherIndex] = isCopied(first)
          ? [first, second, secondIndex]
          : [second, first, firstIndex];

        conflicts[copied.intervalIndex] ??= {
          key: "overlapCopied",
          dayOfWeek: copied.dayOfWeek,
          otherDayOfWeek: other.dayOfWeek,
          hours: formatInterval(openingHours[otherIndex]),
        };

        continue;
      }

      const [draft, other, otherIndex] = first.fromDraft
        ? [first, second, secondIndex]
        : [second, first, firstIndex];

      conflicts[draft.intervalIndex] ??= {
        key: "overlapWithDay",
        dayOfWeek: other.dayOfWeek,
        hours: formatInterval(openingHours[otherIndex]),
      };
    }
  }

  return conflicts;
}

// Converte os details da API (openingHours.N.campo) para os campos do painel.
function mapServerErrors(details, sources) {
  const fields = {};
  let formCode = "";
  let hasOverlap = false;

  for (const detail of details) {
    const [root, rawIndex, field] = detail.field.split(".");

    if (root !== "openingHours") {
      continue;
    }

    if (detail.code === "OPENING_HOURS_OVERLAP") {
      hasOverlap = true;
      continue;
    }

    const source = sources[Number(rawIndex)];

    if (source?.fromDraft && (field === "opensAt" || field === "closesAt")) {
      fields[getFieldKey(source.intervalIndex, field)] ??= detail.code;
      continue;
    }

    formCode ||= detail.code;
  }

  return { fields, formCode, hasOverlap };
}

async function requestOpeningHoursUpdate(openingHours) {
  const response = await adminFetch("/api/admin/business/opening-hours", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ openingHours }),
  });

  // A reautenticação aparece na página; o painel mantém o que foi escrito.
  if (response.status === 401) {
    return { status: "expired" };
  }

  const data = await response.json();

  if (response.ok) {
    return { status: "saved", openingHours: data.settings.openingHours ?? [] };
  }

  if (
    response.status === 400 &&
    data.error === "INVALID_OPENING_HOURS_DATA" &&
    Array.isArray(data.details)
  ) {
    return { status: "invalid", details: data.details };
  }

  return { status: "failed" };
}

export default function OpeningHoursEditor({
  initialOpeningHours,
  isSessionExpired,
}) {
  const { t } = useAdminLanguage();

  const [savedOpeningHours, setSavedOpeningHours] = useState(
    initialOpeningHours ?? []
  );
  const [panel, setPanel] = useState(null);
  const [draftIntervals, setDraftIntervals] = useState([]);
  const [copyTargetDays, setCopyTargetDays] = useState([]);
  const [pendingSwitch, setPendingSwitch] = useState(null);
  const [errors, setErrors] = useState(NO_ERRORS);
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const checkboxRefs = useRef({});
  const editButtonRefs = useRef({});
  const panelRef = useRef(null);
  const pendingFocusRef = useRef(null);

  const dayNames = t("settings.openingHours.days");
  const savedDays = groupOpeningHoursByDay(savedOpeningHours);
  const hasSavedOpeningHours = savedOpeningHours.length > 0;

  // O foco só é aplicado depois do render que mostra ou esconde o elemento.
  useEffect(() => {
    const target = pendingFocusRef.current;

    if (!target) {
      return;
    }

    pendingFocusRef.current = null;

    if (target.type === "checkbox") {
      checkboxRefs.current[target.dayOfWeek]?.focus();
      return;
    }

    if (target.type === "edit") {
      (
        editButtonRefs.current[target.dayOfWeek] ??
        checkboxRefs.current[target.dayOfWeek]
      )?.focus();
      return;
    }

    const selector = {
      firstField: 'input[type="text"]',
      firstError: '[aria-invalid="true"]',
      autofocus: '[data-autofocus="true"]',
    }[target.type];

    const element = panelRef.current?.querySelector(selector);

    if (!element) {
      return;
    }

    if (target.type === "firstError") {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus({ preventScroll: true });
      return;
    }

    element.focus();
  });

  function focusAfterRender(type, dayOfWeek) {
    pendingFocusRef.current = { type, dayOfWeek };
  }

  function getDayName(dayOfWeek) {
    return dayNames[dayOfWeek - 1];
  }

  function formatDayList(days) {
    return days.map(getDayName).join(", ");
  }

  function getSavedIntervals(dayOfWeek) {
    return savedDays[dayOfWeek - 1].intervals;
  }

  function isPanelDirty() {
    if (!panel || panel.mode !== "edit") {
      return false;
    }

    const baseline = panel.isNewDay
      ? [EMPTY_INTERVAL]
      : getSavedIntervals(panel.dayOfWeek);

    return (
      copyTargetDays.length > 0 || !haveSameIntervals(draftIntervals, baseline)
    );
  }

  function openPanel(request) {
    setPanel(request);
    setDraftIntervals(
      request.isNewDay
        ? [{ ...EMPTY_INTERVAL }]
        : getSavedIntervals(request.dayOfWeek).map((interval) => ({
            ...interval,
          }))
    );
    setCopyTargetDays([]);
    setPendingSwitch(null);
    setErrors(NO_ERRORS);
    setFormError("");
    setStatusMessage(null);
    focusAfterRender(request.mode === "remove" ? "autofocus" : "firstField");
  }

  // Com alterações por gravar noutro dia (ou noutro modo), pede confirmação.
  function requestPanel(request) {
    const isSamePanel =
      panel?.dayOfWeek === request.dayOfWeek && panel?.mode === request.mode;

    if (isSamePanel) {
      if (pendingSwitch) {
        setPendingSwitch(null);
        focusAfterRender("firstField");
        return;
      }

      // Sem mudança de estado não há render: o foco vai já para o painel.
      panelRef.current
        ?.querySelector(
          request.mode === "remove"
            ? '[data-autofocus="true"]'
            : 'input[type="text"]'
        )
        ?.focus();
      return;
    }

    if (isPanelDirty()) {
      setPendingSwitch(request);
      focusAfterRender("autofocus");
      return;
    }

    openPanel(request);
  }

  function closePanel() {
    focusAfterRender(panel.origin, panel.dayOfWeek);
    setPanel(null);
    setDraftIntervals([]);
    setCopyTargetDays([]);
    setPendingSwitch(null);
    setErrors(NO_ERRORS);
    setFormError("");
  }

  function handleOpenChange(dayOfWeek, isOpen) {
    if (isOpen) {
      requestPanel({
        mode: "edit",
        dayOfWeek,
        isNewDay: true,
        origin: "checkbox",
      });
      return;
    }

    // Desmarcar um dia aberto mas ainda não gravado é o mesmo que cancelar.
    if (panel?.dayOfWeek === dayOfWeek && panel.isNewDay) {
      closePanel();
      return;
    }

    requestPanel({
      mode: "remove",
      dayOfWeek,
      isNewDay: false,
      origin: "checkbox",
    });
  }

  function handleEdit(dayOfWeek) {
    requestPanel({
      mode: "edit",
      dayOfWeek,
      isNewDay: false,
      origin: "edit",
    });
  }

  function handleKeepEditing() {
    setPendingSwitch(null);
    focusAfterRender("firstField");
  }

  function handlePanelKeyDown(event) {
    if (event.key !== "Escape" || isSaving) {
      return;
    }

    event.preventDefault();

    if (pendingSwitch) {
      handleKeepEditing();
      return;
    }

    closePanel();
  }

  function updateInterval(intervalIndex, field, value) {
    setDraftIntervals((current) =>
      current.map((interval, index) =>
        index === intervalIndex ? { ...interval, [field]: value } : interval
      )
    );
  }

  function handleAddInterval() {
    setDraftIntervals((current) => [...current, { ...EMPTY_INTERVAL }]);
  }

  function handleRemoveInterval(intervalIndex) {
    setDraftIntervals((current) =>
      current.filter((_, index) => index !== intervalIndex)
    );
    setErrors(NO_ERRORS);
  }

  function updateCopyTargetDays(nextDays) {
    setCopyTargetDays(nextDays);
    setErrors((current) => ({ ...current, conflicts: {} }));
  }

  function handleCopyDayChange(dayOfWeek, isSelected) {
    updateCopyTargetDays(
      DAYS_OF_WEEK.filter((day) =>
        day === dayOfWeek ? isSelected : copyTargetDays.includes(day)
      )
    );
  }

  function handleSelectAllCopyDays() {
    updateCopyTargetDays(DAYS_OF_WEEK.filter((day) => day !== panel.dayOfWeek));
  }

  function applyServerErrors(details, sources, openingHours) {
    const { fields, formCode, hasOverlap } = mapServerErrors(details, sources);

    const conflicts = hasOverlap
      ? findDraftConflicts(openingHours, sources, panel.dayOfWeek)
      : {};

    const hasPanelErrors =
      Object.keys(fields).length > 0 || Object.keys(conflicts).length > 0;

    setErrors({ fields, conflicts });
    setFormError(
      formCode
        ? (ERROR_MESSAGES[formCode] ?? "settings.openingHours.saveFailed")
        : hasPanelErrors
          ? "settings.openingHours.fixErrors"
          : "settings.openingHours.saveFailed"
    );

    if (hasPanelErrors) {
      focusAfterRender("firstError");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSaving || isSessionExpired) {
      return;
    }

    const normalizedIntervals = draftIntervals.map((interval) => ({
      opensAt: normalizeTimeInput(interval.opensAt),
      closesAt: normalizeTimeInput(interval.closesAt),
    }));

    setDraftIntervals(normalizedIntervals);
    setFormError("");
    setStatusMessage(null);

    const fieldErrors = validateDraftIntervals(normalizedIntervals);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors({ fields: fieldErrors, conflicts: {} });
      setFormError("settings.openingHours.fixErrors");
      focusAfterRender("firstError");
      return;
    }

    const { dayOfWeek, origin } = panel;

    const { openingHours, sources } = toOpeningHoursPayload(
      savedDays,
      [dayOfWeek, ...copyTargetDays],
      normalizedIntervals
    );

    const conflicts = findDraftConflicts(openingHours, sources, dayOfWeek);

    if (Object.keys(conflicts).length > 0) {
      setErrors({ fields: {}, conflicts });
      setFormError("settings.openingHours.fixErrors");
      focusAfterRender("firstError");
      return;
    }

    setErrors(NO_ERRORS);
    setIsSaving(true);

    try {
      const result = await requestOpeningHoursUpdate(openingHours);

      if (result.status === "expired") {
        return;
      }

      if (result.status === "invalid") {
        applyServerErrors(result.details, sources, openingHours);
        return;
      }

      if (result.status !== "saved") {
        setFormError("settings.openingHours.saveFailed");
        return;
      }

      setSavedOpeningHours(result.openingHours);
      setStatusMessage({
        key:
          copyTargetDays.length > 0
            ? "settings.openingHours.daySavedAndCopied"
            : "settings.openingHours.daySaved",
        dayOfWeek,
        copiedDays: copyTargetDays,
      });
      setPanel(null);
      setDraftIntervals([]);
      setCopyTargetDays([]);
      focusAfterRender(origin, dayOfWeek);
    } catch {
      setFormError("settings.openingHours.saveFailed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmRemove() {
    if (isSaving || isSessionExpired) {
      return;
    }

    const { dayOfWeek } = panel;
    const { openingHours } = toOpeningHoursPayload(savedDays, [dayOfWeek], []);

    setFormError("");
    setIsSaving(true);

    try {
      const result = await requestOpeningHoursUpdate(openingHours);

      if (result.status === "expired") {
        return;
      }

      if (result.status !== "saved") {
        setFormError("settings.openingHours.saveFailed");
        return;
      }

      setSavedOpeningHours(result.openingHours);
      setStatusMessage({
        key: "settings.openingHours.dayRemoved",
        dayOfWeek,
        copiedDays: [],
      });
      setPanel(null);
      focusAfterRender("checkbox", dayOfWeek);
    } catch {
      setFormError("settings.openingHours.saveFailed");
    } finally {
      setIsSaving(false);
    }
  }

  function getErrorMessage(code) {
    return t(ERROR_MESSAGES[code] ?? "settings.openingHours.saveFailed");
  }

  function getConflictMessage(conflict) {
    return t(`settings.openingHours.${conflict.key}`, {
      day: conflict.dayOfWeek ? getDayName(conflict.dayOfWeek) : "",
      otherDay: conflict.otherDayOfWeek
        ? getDayName(conflict.otherDayOfWeek)
        : "",
      hours: conflict.hours ?? "",
    });
  }

  // Dias copiados que colidem, para assinalar o checkbox respetivo.
  const copyConflictIds = {};

  Object.entries(errors.conflicts).forEach(([intervalIndex, conflict]) => {
    if (conflict.key === "overlapCopied") {
      copyConflictIds[conflict.dayOfWeek] ??= getConflictId(intervalIndex);
    }
  });

  const panelDayName = panel ? getDayName(panel.dayOfWeek) : "";

  return (
    <section
      className={`${styles.userFormCard} ${styles.settingsFormCard}`}
      aria-labelledby="opening-hours-title"
    >
      <div className={styles.settingsCardHeader}>
        <h2 id="opening-hours-title">{t("settings.openingHours.title")}</h2>
      </div>

      <p
        className={
          statusMessage
            ? `${styles.successMessage} ${styles.openingHoursStatus}`
            : undefined
        }
        role="status"
      >
        {statusMessage &&
          t(statusMessage.key, {
            day: getDayName(statusMessage.dayOfWeek),
            days: formatDayList(statusMessage.copiedDays),
          })}
      </p>

      <table className={styles.openingHoursTable}>
        <caption className={styles.openingHoursVisuallyHidden}>
          {t("settings.openingHours.caption")}
        </caption>

        <thead>
          <tr>
            <th scope="col">{t("settings.openingHours.columnOpen")}</th>
            <th scope="col">{t("settings.openingHours.columnDay")}</th>
            <th scope="col">{t("settings.openingHours.columnHours")}</th>
            <th scope="col">
              <span className={styles.openingHoursVisuallyHidden}>
                {t("settings.openingHours.columnActions")}
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {savedDays.map(({ dayOfWeek, intervals }) => {
            const dayName = getDayName(dayOfWeek);
            const isOpen = intervals.length > 0;
            const isPanelDay = panel?.dayOfWeek === dayOfWeek;
            const isEditingDay = isPanelDay && panel.mode === "edit";

            return (
              <tr
                key={dayOfWeek}
                className={
                  isPanelDay ? styles.openingHoursActiveRow : undefined
                }
              >
                <td className={styles.openingHoursCheckboxCell}>
                  <input
                    ref={(element) => {
                      checkboxRefs.current[dayOfWeek] = element;
                    }}
                    type="checkbox"
                    checked={isOpen || (isPanelDay && panel.isNewDay)}
                    disabled={isSaving}
                    aria-label={t("settings.openingHours.openDayLabel", {
                      day: dayName,
                    })}
                    onChange={(event) =>
                      handleOpenChange(dayOfWeek, event.target.checked)
                    }
                  />
                </td>

                <th scope="row">{dayName}</th>

                <td className={styles.openingHoursHours}>
                  {isOpen
                    ? intervals.map((interval) => (
                        <span key={interval.opensAt}>
                          {formatInterval(interval)}
                        </span>
                      ))
                    : t("settings.openingHours.closed")}
                </td>

                <td className={styles.openingHoursActionCell}>
                  {isOpen && (
                    <button
                      ref={(element) => {
                        editButtonRefs.current[dayOfWeek] = element;
                      }}
                      type="button"
                      className={`${styles.editButton} ${styles.openingHoursEditButton}`}
                      disabled={isSaving}
                      aria-label={t("settings.openingHours.editDayLabel", {
                        day: dayName,
                      })}
                      aria-expanded={isEditingDay}
                      aria-controls={isEditingDay ? PANEL_ID : undefined}
                      onClick={() => handleEdit(dayOfWeek)}
                    >
                      {t("settings.edit")}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!hasSavedOpeningHours && (
        <p
          className={`${styles.settingsReadValue} ${styles.openingHoursEmpty}`}
        >
          {t("settings.openingHours.notDefined")}
        </p>
      )}

      {panel && (
        <div
          id={PANEL_ID}
          ref={panelRef}
          className={styles.openingHoursPanel}
          role="group"
          aria-labelledby="opening-hours-panel-title"
          onKeyDown={handlePanelKeyDown}
        >
          <h3 id="opening-hours-panel-title">
            {t("settings.openingHours.panelTitle", { day: panelDayName })}
          </h3>

          {pendingSwitch && (
            <div className={styles.deleteConfirmation} role="alert">
              <strong>
                {t("settings.openingHours.unsavedQuestion", {
                  day: panelDayName,
                })}
              </strong>

              <div className={styles.deleteConfirmationActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  data-autofocus="true"
                  onClick={handleKeepEditing}
                >
                  {t("settings.openingHours.keepEditing")}
                </button>

                <button
                  type="button"
                  className={styles.confirmDeleteButton}
                  onClick={() => openPanel(pendingSwitch)}
                >
                  {pendingSwitch.dayOfWeek === panel.dayOfWeek
                    ? t("settings.openingHours.discardChanges")
                    : t("settings.openingHours.discardAndOpen", {
                        day: getDayName(pendingSwitch.dayOfWeek),
                      })}
                </button>
              </div>
            </div>
          )}

          {panel.mode === "remove" ? (
            <div className={styles.deleteConfirmation} role="alert">
              <strong>
                {t("settings.openingHours.removeQuestion", {
                  day: panelDayName,
                })}
              </strong>
              <p>{t("settings.openingHours.removeDescription")}</p>

              {formError && <p>{t(formError)}</p>}

              <div className={styles.deleteConfirmationActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  data-autofocus="true"
                  disabled={isSaving}
                  onClick={closePanel}
                >
                  {t("settings.openingHours.keepHours")}
                </button>

                <button
                  type="button"
                  className={styles.confirmDeleteButton}
                  disabled={isSaving || isSessionExpired}
                  onClick={handleConfirmRemove}
                >
                  {isSaving
                    ? t("settings.saving")
                    : t("settings.openingHours.confirmRemove")}
                </button>
              </div>
            </div>
          ) : (
            <form
              className={styles.openingHoursPanelForm}
              onSubmit={handleSubmit}
              noValidate
            >
              <p className={styles.openingHoursNote}>
                {t("settings.openingHours.overnightNote")}
              </p>

              {draftIntervals.map((interval, intervalIndex) => {
                const conflict = errors.conflicts[intervalIndex];
                const conflictId = getConflictId(intervalIndex);

                return (
                  <Fragment key={intervalIndex}>
                    <div className={styles.openingHoursInterval}>
                      {["opensAt", "closesAt"].map((field) => {
                        const fieldId = getFieldId(intervalIndex, field);
                        const errorCode =
                          errors.fields[getFieldKey(intervalIndex, field)];
                        const describedBy = [
                          errorCode && `${fieldId}-error`,
                          conflict && conflictId,
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <div key={field} className={styles.field}>
                            <label htmlFor={fieldId}>
                              {t(`settings.openingHours.${field}`)}
                            </label>

                            <input
                              id={fieldId}
                              className={styles.openingHoursTimeInput}
                              type="text"
                              inputMode="numeric"
                              placeholder="HH:MM"
                              maxLength={5}
                              autoComplete="off"
                              value={interval[field]}
                              disabled={isSaving}
                              aria-invalid={
                                errorCode || conflict ? "true" : undefined
                              }
                              aria-describedby={describedBy || undefined}
                              onChange={(event) =>
                                updateInterval(
                                  intervalIndex,
                                  field,
                                  event.target.value
                                )
                              }
                              onBlur={(event) =>
                                updateInterval(
                                  intervalIndex,
                                  field,
                                  normalizeTimeInput(event.target.value)
                                )
                              }
                            />

                            {errorCode && (
                              <p
                                id={`${fieldId}-error`}
                                className={styles.openingHoursFieldError}
                              >
                                {getErrorMessage(errorCode)}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {intervalIndex > 0 && (
                        <button
                          type="button"
                          className={styles.cancelButton}
                          disabled={isSaving}
                          onClick={() => handleRemoveInterval(intervalIndex)}
                        >
                          {t("settings.openingHours.removeInterval")}
                        </button>
                      )}
                    </div>

                    {conflict && (
                      <p
                        id={conflictId}
                        className={styles.openingHoursFieldError}
                      >
                        {getConflictMessage(conflict)}
                      </p>
                    )}
                  </Fragment>
                );
              })}

              {draftIntervals.length < MAX_INTERVALS_IN_FORM && (
                <div className={styles.openingHoursPanelActions}>
                  <button
                    type="button"
                    className={styles.editButton}
                    disabled={isSaving}
                    onClick={handleAddInterval}
                  >
                    {t("settings.openingHours.addInterval")}
                  </button>
                </div>
              )}

              <fieldset
                className={styles.openingHoursCopyDays}
                disabled={isSaving}
              >
                <legend>{t("settings.openingHours.copyToOtherDays")}</legend>

                <div className={styles.openingHoursCopyDayList}>
                  {DAYS_OF_WEEK.filter((day) => day !== panel.dayOfWeek).map(
                    (dayOfWeek) => (
                      <label key={dayOfWeek} className={styles.checkboxField}>
                        <input
                          type="checkbox"
                          checked={copyTargetDays.includes(dayOfWeek)}
                          aria-invalid={
                            copyConflictIds[dayOfWeek] ? "true" : undefined
                          }
                          aria-describedby={copyConflictIds[dayOfWeek]}
                          onChange={(event) =>
                            handleCopyDayChange(dayOfWeek, event.target.checked)
                          }
                        />
                        {getDayName(dayOfWeek)}
                      </label>
                    )
                  )}
                </div>

                <div className={styles.openingHoursPanelActions}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={handleSelectAllCopyDays}
                  >
                    {t("settings.openingHours.selectAllDays")}
                  </button>

                  {copyTargetDays.length > 0 && (
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => updateCopyTargetDays([])}
                    >
                      {t("settings.openingHours.undoCopy")}
                    </button>
                  )}
                </div>

                <p className={styles.openingHoursCopyMessage} role="status">
                  {copyTargetDays.length > 0 &&
                    t("settings.openingHours.copyPending", {
                      days: formatDayList(copyTargetDays),
                    })}
                </p>
              </fieldset>

              <div className={styles.openingHoursPanelActions}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isSaving || isSessionExpired}
                >
                  {isSaving ? t("settings.saving") : t("settings.save")}
                </button>

                <button
                  type="button"
                  className={styles.editButton}
                  disabled={isSaving}
                  onClick={closePanel}
                >
                  {t("settings.cancel")}
                </button>
              </div>

              {formError && (
                <p className={styles.error} role="alert">
                  {t(formError)}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </section>
  );
}
