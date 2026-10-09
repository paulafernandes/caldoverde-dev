import { useState } from "react";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { adminFetch } from "../../lib/adminFetch";
import {
  findOverlappingOpeningHours,
  groupOpeningHoursByDay,
  isValidOpeningHourTime,
} from "../../utils/openingHours";
import styles from "../../styles/Admin.module.css";

// Limite só da interface; o modelo e a API aceitam mais intervalos por dia.
const MAX_INTERVALS_IN_FORM = 2;

const EMPTY_INTERVAL = { opensAt: "", closesAt: "" };

const ERROR_MESSAGES = {
  INVALID_TIME_FORMAT: "settings.openingHours.invalidTimeFormat",
  SAME_OPEN_CLOSE_TIME: "settings.openingHours.sameOpenCloseTime",
  OPENING_HOURS_OVERLAP: "settings.openingHours.overlap",
  TOO_MANY_OPENING_HOURS: "settings.openingHours.tooMany",
  INVALID_DAY_OF_WEEK: "settings.openingHours.invalidDay",
};

function toFormDays(openingHours) {
  return groupOpeningHoursByDay(openingHours).map(
    ({ dayOfWeek, intervals }) => ({
      dayOfWeek,
      isOpen: intervals.length > 0,
      intervals,
    })
  );
}

// Lista enviada à API e, para cada posição, o dia e o intervalo de origem.
function toOpeningHoursPayload(days) {
  const openingHours = [];
  const sources = [];

  days.forEach((day, dayIndex) => {
    if (!day.isOpen) {
      return;
    }

    day.intervals.forEach((interval, intervalIndex) => {
      openingHours.push({
        dayOfWeek: day.dayOfWeek,
        opensAt: interval.opensAt.trim(),
        closesAt: interval.closesAt.trim(),
      });

      sources.push({ dayIndex, intervalIndex });
    });
  });

  return { openingHours, sources };
}

function getFieldKey(dayIndex, intervalIndex, field) {
  return `${dayIndex}-${intervalIndex}-${field}`;
}

function getFieldId(dayIndex, intervalIndex, field) {
  return `opening-hours-${getFieldKey(dayIndex, intervalIndex, field)}`;
}

function validateOpeningHours(openingHours, sources) {
  const errors = {};

  openingHours.forEach((openingHour, index) => {
    const { dayIndex, intervalIndex } = sources[index];

    for (const field of ["opensAt", "closesAt"]) {
      if (!isValidOpeningHourTime(openingHour[field])) {
        errors[getFieldKey(dayIndex, intervalIndex, field)] =
          "INVALID_TIME_FORMAT";
      }
    }

    if (
      !errors[getFieldKey(dayIndex, intervalIndex, "opensAt")] &&
      !errors[getFieldKey(dayIndex, intervalIndex, "closesAt")] &&
      openingHour.opensAt === openingHour.closesAt
    ) {
      errors[getFieldKey(dayIndex, intervalIndex, "closesAt")] =
        "SAME_OPEN_CLOSE_TIME";
    }
  });

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  for (const index of findOverlappingOpeningHours(openingHours)) {
    errors[`day-${sources[index].dayIndex}`] = "OPENING_HOURS_OVERLAP";
  }

  return errors;
}

// Converte os details da API (openingHours.N.campo) para as chaves do formulário.
function mapServerErrors(details, sources) {
  const errors = {};

  for (const detail of details) {
    const [root, rawIndex, field] = detail.field.split(".");

    if (root !== "openingHours") {
      continue;
    }

    const source = sources[Number(rawIndex)];

    if (!source) {
      errors.form = detail.code;
      continue;
    }

    const key =
      field === "opensAt" || field === "closesAt"
        ? getFieldKey(source.dayIndex, source.intervalIndex, field)
        : `day-${source.dayIndex}`;

    errors[key] ??= detail.code;
  }

  return errors;
}

export default function OpeningHoursEditor({
  initialOpeningHours,
  isSessionExpired,
}) {
  const { t } = useAdminLanguage();

  const [savedOpeningHours, setSavedOpeningHours] = useState(
    initialOpeningHours ?? []
  );
  const [days, setDays] = useState(() => toFormDays(initialOpeningHours));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const dayNames = t("settings.openingHours.days");
  const savedDays = groupOpeningHoursByDay(savedOpeningHours);
  const hasSavedOpeningHours = savedOpeningHours.length > 0;

  function getErrorMessage(code) {
    return t(ERROR_MESSAGES[code] ?? "settings.openingHours.saveFailed");
  }

  function clearMessages() {
    setErrors({});
    setFormError("");
    setSuccess("");
    setCopyMessage("");
  }

  function updateDay(dayIndex, updateFn) {
    setDays((current) =>
      current.map((day, index) => (index === dayIndex ? updateFn(day) : day))
    );
  }

  function handleEdit() {
    clearMessages();
    setDays(toFormDays(savedOpeningHours));
    setIsEditing(true);
  }

  function handleCancel() {
    clearMessages();
    setDays(toFormDays(savedOpeningHours));
    setIsEditing(false);
  }

  function handleOpenChange(dayIndex, isOpen) {
    setCopyMessage("");

    updateDay(dayIndex, (day) => ({
      ...day,
      isOpen,
      intervals:
        isOpen && day.intervals.length === 0
          ? [{ ...EMPTY_INTERVAL }]
          : day.intervals,
    }));
  }

  function handleTimeChange(dayIndex, intervalIndex, field, value) {
    setCopyMessage("");

    updateDay(dayIndex, (day) => ({
      ...day,
      intervals: day.intervals.map((interval, index) =>
        index === intervalIndex ? { ...interval, [field]: value } : interval
      ),
    }));
  }

  function handleAddInterval(dayIndex) {
    setCopyMessage("");

    updateDay(dayIndex, (day) => ({
      ...day,
      intervals: [...day.intervals, { ...EMPTY_INTERVAL }],
    }));
  }

  function handleRemoveInterval(dayIndex, intervalIndex) {
    setCopyMessage("");

    updateDay(dayIndex, (day) => ({
      ...day,
      intervals: day.intervals.filter((_, index) => index !== intervalIndex),
    }));
  }

  function handleCopyToOtherDays(dayIndex) {
    const sourceDay = days[dayIndex];

    setErrors({});
    setFormError("");
    setDays((current) =>
      current.map((day) => ({
        ...day,
        isOpen: sourceDay.isOpen,
        intervals: sourceDay.intervals.map((interval) => ({ ...interval })),
      }))
    );
    setCopyMessage(
      t("settings.openingHours.copiedToOtherDays", {
        day: dayNames[dayIndex],
      })
    );
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      const form = document.getElementById("opening-hours-form");

      const firstInvalidField = form?.querySelector(
        '[aria-invalid="true"], [data-day-error="true"] input[type="text"]'
      );

      if (!firstInvalidField) {
        return;
      }

      firstInvalidField.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      firstInvalidField.focus({
        preventScroll: true,
      });
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    clearMessages();

    const { openingHours, sources } = toOpeningHoursPayload(days);
    const nextErrors = validateOpeningHours(openingHours, sources);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError("settings.openingHours.fixErrors");
      focusFirstError();
      return;
    }

    setIsSaving(true);

    try {
      const response = await adminFetch("/api/admin/business/opening-hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ openingHours }),
      });

      // A reautenticação aparece na página; o formulário mantém o que foi escrito.
      if (response.status === 401) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error === "INVALID_OPENING_HOURS_DATA" &&
          Array.isArray(data.details)
        ) {
          const serverErrors = mapServerErrors(data.details, sources);
          const { form: formCode, ...fieldErrors } = serverErrors;

          setErrors(fieldErrors);
          setFormError(
            formCode
              ? (ERROR_MESSAGES[formCode] ?? "settings.openingHours.saveFailed")
              : "settings.openingHours.fixErrors"
          );
          focusFirstError();
          return;
        }

        throw new Error(data.error ?? "OPENING_HOURS_UPDATE_FAILED");
      }

      const nextOpeningHours = data.settings.openingHours ?? [];

      setSavedOpeningHours(nextOpeningHours);
      setDays(toFormDays(nextOpeningHours));
      setIsEditing(false);
      setSuccess("settings.openingHours.saveSuccess");
    } catch {
      setFormError("settings.openingHours.saveFailed");
    } finally {
      setIsSaving(false);
    }
  }

  function formatIntervals(intervals) {
    return intervals
      .map(({ opensAt, closesAt }) => `${opensAt}–${closesAt}`)
      .join(", ");
  }

  return (
    <section
      className={`${styles.userFormCard} ${styles.settingsFormCard}`}
      aria-labelledby="opening-hours-title"
    >
      <div className={styles.settingsCardHeader}>
        <h2 id="opening-hours-title">{t("settings.openingHours.title")}</h2>

        {!isEditing && (
          <button
            type="button"
            className={styles.editButton}
            onClick={handleEdit}
          >
            {t("settings.edit")}
          </button>
        )}
      </div>

      {success && (
        <p
          className={`${styles.successMessage} ${styles.formMessage}`}
          role="status"
        >
          {t(success)}
        </p>
      )}

      {isEditing ? (
        <form
          id="opening-hours-form"
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          <p className={styles.openingHoursNote}>
            {t("settings.openingHours.overnightNote")}
          </p>

          {days.map((day, dayIndex) => {
            const dayErrorCode = errors[`day-${dayIndex}`];
            const dayErrorId = `opening-hours-day-${dayIndex}-error`;

            return (
              <fieldset
                key={day.dayOfWeek}
                className={styles.openingHoursDay}
                data-day-error={dayErrorCode ? "true" : undefined}
                aria-describedby={dayErrorCode ? dayErrorId : undefined}
                disabled={isSaving}
              >
                <legend>{dayNames[dayIndex]}</legend>

                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(event) =>
                      handleOpenChange(dayIndex, event.target.checked)
                    }
                  />
                  {t("settings.openingHours.open")}
                </label>

                {day.isOpen &&
                  day.intervals.map((interval, intervalIndex) => (
                    <div
                      key={intervalIndex}
                      className={styles.openingHoursInterval}
                    >
                      {["opensAt", "closesAt"].map((field) => {
                        const fieldId = getFieldId(
                          dayIndex,
                          intervalIndex,
                          field
                        );
                        const errorCode =
                          errors[getFieldKey(dayIndex, intervalIndex, field)];

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
                              aria-invalid={errorCode ? "true" : undefined}
                              aria-describedby={
                                errorCode ? `${fieldId}-error` : undefined
                              }
                              onChange={(event) =>
                                handleTimeChange(
                                  dayIndex,
                                  intervalIndex,
                                  field,
                                  event.target.value
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
                          onClick={() =>
                            handleRemoveInterval(dayIndex, intervalIndex)
                          }
                        >
                          {t("settings.openingHours.removeInterval")}
                        </button>
                      )}
                    </div>
                  ))}

                {dayErrorCode && (
                  <p id={dayErrorId} className={styles.openingHoursFieldError}>
                    {getErrorMessage(dayErrorCode)}
                  </p>
                )}

                <div className={styles.openingHoursDayActions}>
                  {day.isOpen &&
                    day.intervals.length < MAX_INTERVALS_IN_FORM && (
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => handleAddInterval(dayIndex)}
                      >
                        {t("settings.openingHours.addInterval")}
                      </button>
                    )}

                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => handleCopyToOtherDays(dayIndex)}
                  >
                    {t("settings.openingHours.copyToOtherDays")}
                  </button>
                </div>
              </fieldset>
            );
          })}

          <p className={styles.openingHoursCopyMessage} role="status">
            {copyMessage}
          </p>

          <div className={styles.userFormActions}>
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
              onClick={handleCancel}
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
      ) : hasSavedOpeningHours ? (
        <dl className={styles.openingHoursReadList}>
          {savedDays.map(({ dayOfWeek, intervals }, dayIndex) => (
            <div key={dayOfWeek} className={styles.settingsReadItem}>
              <dt className={styles.settingsReadLabel}>{dayNames[dayIndex]}</dt>

              <dd className={styles.settingsReadValue}>
                {intervals.length > 0
                  ? formatIntervals(intervals)
                  : t("settings.openingHours.closed")}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={styles.settingsReadValue}>
          {t("settings.openingHours.notDefined")}
        </p>
      )}
    </section>
  );
}
