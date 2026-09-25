import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getAdministrativeAreaConfig } from "../../data/administrativeAreas";
import styles from "../../styles/Admin.module.css";

export default function AdministrativeAreaSelect({
  id,
  name,
  countryCode,
  value,
  disabled = false,
  required = false,
  onChange,
  onBlur,
}) {
  const { language, t } = useAdminLanguage();

  const config = getAdministrativeAreaConfig(countryCode);

  if (!config) {
    return null;
  }

  return (
    <>
      <label htmlFor={id}>
        {config.label[language] ?? config.label.en}

        {required && (
          <span className={styles.requiredMark} aria-hidden="true">
            *
          </span>
        )}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
      >
        <option value="">{t("settings.selectAdministrativeArea")}</option>

        {config.areas.map((area) => (
          <option key={area.code} value={area.code}>
            {area.label[language] ?? area.label.en}
          </option>
        ))}
      </select>
    </>
  );
}
