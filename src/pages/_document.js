import NextDocument, { Html, Head, Main, NextScript } from "next/document";

const supportedLanguages = ["pt", "es", "en"];

export default function Document({ language }) {
  return (
    <Html lang={language}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx) => {
  const initialProps = await NextDocument.getInitialProps(ctx);

  const isPublicLanguagePage =
    ctx.pathname === "/[lang]" || ctx.pathname.startsWith("/[lang]/");

  const isAdminPage =
    ctx.pathname === "/admin" || ctx.pathname.startsWith("/admin/");

  let language = "en";

  if (isPublicLanguagePage && supportedLanguages.includes(ctx.query.lang)) {
    language = ctx.query.lang;
  } else if (isAdminPage) {
    language = "pt";
  }

  return {
    ...initialProps,
    language,
  };
};
