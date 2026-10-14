// Texto do aviso legal, por idioma.
// Para acrescentar texto: preencher title, lastUpdated ("AAAA-MM-DD") e sections.
// Exemplo de secção:
// {
//   heading: "Responsável pelo tratamento",
//   paragraphs: [
//     "Primeiro parágrafo.",
//     "Contacte-nos em [geral@exemplo.com](mailto:geral@exemplo.com). Os dados são tratados **apenas** para responder.",
//   ],
//   items: ["Ponto opcional 1", "Ponto opcional 2"], // opcional
// },
// Em paragraphs e items pode usar-se [texto](url) (só https://, http:// e mailto:) e **negrito**.
// Se um idioma ficar com sections vazio, a página usa o texto do idioma predefinido do negócio.
// Enquanto nenhum idioma tiver secções, a página mostra "texto em preparação" e leva noindex.

const legalNotice = {
  es: {
    title: "Aviso legal",
    lastUpdated: null,
    sections: [],
  },
  pt: {
    title: "Aviso legal",
    lastUpdated: null,
    sections: [],
  },
  en: {
    title: "Legal notice",
    lastUpdated: null,
    sections: [],
  },
};

export default legalNotice;
