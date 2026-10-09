import NextDocument, { Html, Head, Main, NextScript } from "next/document";

export default function Document({ language }) {
  return (
    <Html lang={language}>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
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

  if (isPublicLanguagePage && typeof ctx.query.lang === "string") {
    language = ctx.query.lang;
  } else if (isAdminPage) {
    language = "pt";
  }

  return {
    ...initialProps,
    language,
  };
};
