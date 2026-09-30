import { useState } from "react";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { authClient } from "../../lib/authClient";
import styles from "../../styles/Admin.module.css";

export default function AdminReauthentication({
  email,
  isSessionExpired,
  onSuccess,
}) {
  const { t } = useAdminLanguage();

  const [reauthEmail, setReauthEmail] = useState(email);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [reauthFieldErrors, setReauthFieldErrors] = useState({});
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [showReauthForm, setShowReauthForm] = useState(false);

  function validateForm() {
    const errors = {};
    const trimmedEmail = reauthEmail.trim();

    if (!trimmedEmail) {
      errors.email = "validation.emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "validation.emailInvalid";
    }

    if (!reauthPassword) {
      errors.password = "validation.passwordRequired";
    }

    setReauthFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function handleCancel() {
    setShowReauthForm(false);
    setReauthPassword("");
    setReauthError("");
    setReauthFieldErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setReauthError("");

    if (!validateForm()) {
      return;
    }

    setIsReauthenticating(true);

    const { error } = await authClient.signIn.email({
      email: reauthEmail.trim(),
      password: reauthPassword,
    });

    if (error) {
      setReauthError("session.signInFailed");
      setIsReauthenticating(false);
      return;
    }

    setShowReauthForm(false);
    setReauthPassword("");
    setReauthError("");
    setReauthFieldErrors({});
    setIsReauthenticating(false);

    onSuccess();
  }

  if (!isSessionExpired) {
    return null;
  }

  return (
    <div className={styles.sessionExpiredNotice} role="alert">
      <strong>{t("session.expiredTitle")}</strong>

      <p>{t("session.expiredDescription")}</p>

      {!showReauthForm ? (
        <button
          className={styles.saveButton}
          type="button"
          onClick={() => setShowReauthForm(true)}
        >
          {t("session.reauthenticate")}
        </button>
      ) : (
        <form
          className={styles.reauthForm}
          onSubmit={handleSubmit}
          noValidate
        >
          <label>
            <span>{t("session.email")}</span>

            <input
              className={styles.editorInput}
              type="email"
              autoComplete="username"
              required
              disabled={isReauthenticating}
              value={reauthEmail}
              onChange={(event) => {
                setReauthEmail(event.target.value);

                if (reauthFieldErrors.email) {
                  setReauthFieldErrors((current) => ({
                    ...current,
                    email: "",
                  }));
                }

                if (reauthError) {
                  setReauthError("");
                }
              }}
            />

            {reauthFieldErrors.email && (
              <p className={styles.errorMessage} role="alert">
                {t(reauthFieldErrors.email)}
              </p>
            )}
          </label>

          <label>
            <span>{t("session.password")}</span>

            <input
              className={styles.editorInput}
              type="password"
              autoComplete="current-password"
              required
              disabled={isReauthenticating}
              value={reauthPassword}
              onChange={(event) => {
                setReauthPassword(event.target.value);

                if (reauthFieldErrors.password) {
                  setReauthFieldErrors((current) => ({
                    ...current,
                    password: "",
                  }));
                }

                if (reauthError) {
                  setReauthError("");
                }
              }}
            />

            {reauthFieldErrors.password && (
              <p className={styles.errorMessage} role="alert">
                {t(reauthFieldErrors.password)}
              </p>
            )}
          </label>

          {reauthError && (
            <p className={styles.errorMessage} role="alert">
              {t(reauthError)}
            </p>
          )}

          <div className={styles.reauthActions}>
            <button
              className={styles.cancelButton}
              type="button"
              disabled={isReauthenticating}
              onClick={handleCancel}
            >
              {t("session.cancel")}
            </button>

            <button
              className={styles.saveButton}
              type="submit"
              disabled={isReauthenticating}
            >
              {isReauthenticating
                ? t("session.signingIn")
                : t("session.signIn")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
