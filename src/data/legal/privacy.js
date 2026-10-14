// Texto da política de privacidade, por idioma.
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

const privacyPolicy = {
  es: {
    title: "Política de privacidad",
    lastUpdated: null,
    sections: [],
  },
  pt: {
    title: "Política de privacidade",
    lastUpdated: null,
    sections: [],
  },
  en: {
    title: "Privacy policy",
    lastUpdated: null,
    sections: [],
  },
};

export default privacyPolicy;
