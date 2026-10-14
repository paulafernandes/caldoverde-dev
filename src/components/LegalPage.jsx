import { renderInlineText } from "../utils/renderInlineText";

// Página legal genérica (política de privacidade, aviso legal).
// Recebe o texto já resolvido e a data já formatada no servidor.
export default function LegalPage({
  title,
  lastUpdated,
  lastUpdatedText,
  lastUpdatedLabel,
  sections,
  pageLanguage,
  contentLanguage,
  inPreparationText,
  opensInNewTabText,
}) {
  const hasSections = sections.length > 0;

  return (
    <section className="legal-page">
      <article
        className="legal-page-container"
        lang={contentLanguage !== pageLanguage ? contentLanguage : undefined}
      >
        <header className="legal-page-header">
          <h1>{title}</h1>

          {lastUpdated && lastUpdatedText && (
            <p className="legal-page-updated">
              {lastUpdatedLabel}:{" "}
              <time dateTime={lastUpdated}>{lastUpdatedText}</time>
            </p>
          )}
        </header>

        {hasSections ? (
          <div className="legal-page-content">
            {sections.map((section, sectionIndex) => (
              <section
                key={`${sectionIndex}-${section.heading}`}
                className="legal-page-section"
              >
                {section.heading && <h2>{section.heading}</h2>}

                {(section.paragraphs ?? []).map((paragraph, index) => (
                  <p key={`paragraph-${index}`}>
                    {renderInlineText(paragraph, opensInNewTabText)}
                  </p>
                ))}

                {section.items?.length > 0 && (
                  <ul>
                    {section.items.map((item, index) => (
                      <li key={`item-${index}`}>
                        {renderInlineText(item, opensInNewTabText)}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : (
          <p className="legal-page-pending">{inPreparationText}</p>
        )}
      </article>
    </section>
  );
}
