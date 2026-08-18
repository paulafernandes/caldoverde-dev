import Head from "next/head";
import Header from "../components/Header";
import Banner from "../components/Banner";
import About from "../components/About";
import Menu from "../components/Menu";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Caldo Verde</title>

        <meta
          name="description"
          content="Restaurante português Caldo Verde"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <Banner />
        <About />
        <Menu />
      </main>

      <Footer />
    </>
  );
}