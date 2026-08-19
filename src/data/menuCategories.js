const menuCategories = [
  {
    id: "pequeno-almoco",

    label: {
      pt: "Pequeno-almoço",
      es: "Desayuno",
      en: "Breakfast",
    },

    title: {
      pt: "Pequeno-almoço",
      es: "Desayuno",
      en: "Breakfast",
    },

    image: "/assets/images/menu/menu-pequeno-almoco-580x580.png",

    items: [
      {
        id: 1,

        name: {
          pt: "Torrada com manteiga",
          es: "Tostada con mantequilla",
          en: "Toast with butter",
        },

        description: {
          pt: "Pão torrado acompanhado com manteiga.",
          es: "Pan tostado acompañado de mantequilla.",
          en: "Toasted bread served with butter.",
        },

        price: null,
      },
      {
        id: 2,

        name: {
          pt: "Croissant misto",
          es: "Croissant mixto",
          en: "Ham and cheese croissant",
        },

        description: {
          pt: "Croissant com queijo e fiambre.",
          es: "Croissant con queso y jamón cocido.",
          en: "Croissant with ham and cheese.",
        },

        price: null,
      },
      {
        id: 3,

        name: {
          pt: "Café com leite",
          es: "Café con leche",
          en: "Coffee with milk",
        },

        description: {
          pt: "Café preparado com leite quente.",
          es: "Café preparado con leche caliente.",
          en: "Coffee prepared with hot milk.",
        },

        price: null,
      },
    ],
  },

  {
    id: "prato-do-dia",

    label: {
      pt: "Prato do dia",
      es: "Plato del día",
      en: "Daily specials",
    },

    title: {
      pt: "Pratos do dia",
      es: "Platos del día",
      en: "Daily specials",
    },

    image: "/assets/images/menu/bifanas_a_portuguesa.png",

    items: [
      {
        id: 1,

        name: {
          pt: "Bacalhau à Brás",
          es: "Bacalao à Brás",
          en: "Bacalhau à Brás",
        },

        description: {
          pt: "Bacalhau, batata, cebola, ovo e azeitonas.",
          es: "Bacalao, patata, cebolla, huevo y aceitunas.",
          en: "Salt cod, potato, onion, egg and olives.",
        },

        price: null,
      },
      {
        id: 2,

        name: {
          pt: "Arroz de pato",
          es: "Arroz de pato",
          en: "Duck rice",
        },

        description: {
          pt: "Arroz de forno com pato e chouriço.",
          es: "Arroz al horno con pato y chorizo portugués.",
          en: "Oven-baked rice with duck and Portuguese chouriço.",
        },

        price: null,
      },
      {
        id: 3,

        name: {
          pt: "Bifanas à portuguesa",
          es: "Bifanas a la portuguesa",
          en: "Portuguese-style bifanas",
        },

        description: {
          pt: "Carne de porco preparada com molho tradicional.",
          es: "Carne de cerdo preparada con salsa tradicional.",
          en: "Pork prepared with a traditional Portuguese sauce.",
        },

        price: null,
      },
    ],
  },

  {
    id: "petiscos",

    label: {
      pt: "Petiscos para partilhar",
      es: "Entrantes para compartir",
      en: "Small plates to share",
    },

    title: {
      pt: "Petiscos para partilhar",
      es: "Entrantes para compartir",
      en: "Small plates to share",
    },

    image: "/assets/images/menu/amejoas_bulhao_pato.png",

    items: [
      {
        id: 1,

        name: {
          pt: "Chouriço assado",
          es: "Chorizo portugués asado",
          en: "Grilled Portuguese chouriço",
        },

        description: {
          pt: "Chouriço português assado.",
          es: "Chorizo portugués preparado a la parrilla.",
          en: "Traditional grilled Portuguese chouriço.",
        },

        price: null,
      },
      {
        id: 2,

        name: {
          pt: "Pastéis de bacalhau",
          es: "Buñuelos de bacalao",
          en: "Salt cod fritters",
        },

        description: {
          pt: "Pastéis tradicionais de bacalhau e batata.",
          es: "Buñuelos tradicionales de bacalao y patata.",
          en: "Traditional fritters made with salt cod and potato.",
        },

        price: null,
      },
      {
        id: 3,

        name: {
          pt: "Pica-pau",
          es: "Pica-pau",
          en: "Pica-pau",
        },

        description: {
          pt: "Carne temperada acompanhada com pickles.",
          es: "Carne condimentada acompañada de encurtidos.",
          en: "Seasoned meat served with pickles.",
        },

        price: null,
      },
    ],
  },

  {
    id: "sobremesas",

    label: {
      pt: "Sobremesas",
      es: "Postres",
      en: "Desserts",
    },

    title: {
      pt: "Sobremesas",
      es: "Postres",
      en: "Desserts",
    },

    image: "/assets/images/menu/menu-sobremesas-sortido-portugues-580x580.png",

    items: [
      {
        id: 1,

        name: {
          pt: "Pastel de nata",
          es: "Pastel de nata",
          en: "Pastel de nata",
        },

        description: {
          pt: "Massa folhada com creme de nata.",
          es: "Hojaldre relleno de crema.",
          en: "Portuguese puff pastry filled with custard.",
        },

        price: null,
      },
      {
        id: 2,

        name: {
          pt: "Arroz-doce",
          es: "Arroz con leche",
          en: "Portuguese rice pudding",
        },

        description: {
          pt: "Sobremesa tradicional aromatizada com canela.",
          es: "Postre tradicional aromatizado con canela.",
          en: "Traditional rice pudding flavoured with cinnamon.",
        },

        price: null,
      },
      {
        id: 3,

        name: {
          pt: "Baba de camelo",
          es: "Baba de camelo",
          en: "Baba de camelo",
        },

        description: {
          pt: "Mousse portuguesa de leite condensado.",
          es: "Mousse portuguesa de leche condensada.",
          en: "Portuguese condensed milk mousse.",
        },

        price: null,
      },
    ],
  },

  {
    id: "bebidas",

    label: {
      pt: "Bebidas",
      es: "Bebidas",
      en: "Drinks",
    },

    title: {
      pt: "Bebidas",
      es: "Bebidas",
      en: "Drinks",
    },

    image: "/assets/images/menu/menu_bebidas_portuguesas.png",

    items: [
      {
        id: 1,

        name: {
          pt: "Água",
          es: "Agua",
          en: "Water",
        },

        description: {
          pt: "Água mineral com ou sem gás.",
          es: "Agua mineral con o sin gas.",
          en: "Still or sparkling mineral water.",
        },

        price: null,
      },
      {
        id: 2,

        name: {
          pt: "Refrigerantes",
          es: "Refrescos",
          en: "Soft drinks",
        },

        description: {
          pt: "Seleção de refrigerantes.",
          es: "Selección de refrescos.",
          en: "Selection of soft drinks.",
        },

        price: null,
      },
      {
        id: 3,

        name: {
          pt: "Vinho da casa",
          es: "Vino de la casa",
          en: "House wine",
        },

        description: {
          pt: "Vinho português selecionado pelo restaurante.",
          es: "Vino portugués seleccionado por el restaurante.",
          en: "Portuguese wine selected by the restaurant.",
        },

        price: null,
      },
    ],
  },
];

export default menuCategories;