import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>
          Página no encontrada · Página não encontrada · Page not found
        </title>

        <meta name="robots" content="noindex" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/logo_cv.ico" />
      </Head>

      <main id="main-content" className="not-found-page" tabIndex={-1}>
        <Image
          src="/assets/images/logo_andorinha.png"
          alt="Caldo Verde"
          width={280}
          height={100}
          priority
        />

        <h1 lang="es">Página no encontrada</h1>

        <p lang="pt">Página não encontrada</p>

        <p lang="en">Page not found</p>

        <Link href="/" className="about-button">
          <span lang="es">Inicio</span>
          <span aria-hidden="true">·</span>
          <span lang="pt">Início</span>
          <span aria-hidden="true">·</span>
          <span lang="en">Home</span>
        </Link>
      </main>
    </>
  );
}
