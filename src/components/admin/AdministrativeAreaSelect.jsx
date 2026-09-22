import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getAdministrativeAreaConfig } from "../../data/administrativeAreas";

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
        <option value="">
          {t("settings.selectAdministrativeArea")}
        </option>

        {config.areas.map((area) => (
          <option key={area.code} value={area.code}>
            {area.label[language] ?? area.label.en}
          </option>
        ))}
      </select>
    </>
  );
}
