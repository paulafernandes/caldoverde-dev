function sameLabel(label) {
  return {
    pt: label,
    es: label,
    en: label,
  };
}

export const ADMINISTRATIVE_AREAS = {
  ES: {
    label: {
      pt: "Província",
      es: "Provincia",
      en: "Province",
    },

    areas: [
      ["ES-C", "A Coruña"],
      ["ES-VI", "Álava"],
      ["ES-AB", "Albacete"],
      ["ES-A", "Alicante"],
      ["ES-AL", "Almería"],
      ["ES-O", "Asturias"],
      ["ES-AV", "Ávila"],
      ["ES-BA", "Badajoz"],
      ["ES-PM", "Baleares"],
      ["ES-B", "Barcelona"],
      ["ES-BU", "Burgos"],
      ["ES-CC", "Cáceres"],
      ["ES-CA", "Cádiz"],
      ["ES-S", "Cantabria"],
      ["ES-CS", "Castellón"],
      ["ES-CR", "Ciudad Real"],
      ["ES-CO", "Córdoba"],
      ["ES-CU", "Cuenca"],
      ["ES-GI", "Girona"],
      ["ES-GR", "Granada"],
      ["ES-GU", "Guadalajara"],
      ["ES-SS", "Gipuzkoa"],
      ["ES-H", "Huelva"],
      ["ES-HU", "Huesca"],
      ["ES-J", "Jaén"],
      ["ES-LO", "La Rioja"],
      ["ES-GC", "Las Palmas"],
      ["ES-LE", "León"],
      ["ES-L", "Lleida"],
      ["ES-LU", "Lugo"],
      ["ES-M", "Madrid"],
      ["ES-MA", "Málaga"],
      ["ES-MU", "Murcia"],
      ["ES-NA", "Navarra"],
      ["ES-OR", "Ourense"],
      ["ES-P", "Palencia"],
      ["ES-PO", "Pontevedra"],
      ["ES-SA", "Salamanca"],
      ["ES-TF", "Santa Cruz de Tenerife"],
      ["ES-SG", "Segovia"],
      ["ES-SE", "Sevilla"],
      ["ES-SO", "Soria"],
      ["ES-T", "Tarragona"],
      ["ES-TE", "Teruel"],
      ["ES-TO", "Toledo"],
      ["ES-V", "Valencia"],
      ["ES-VA", "Valladolid"],
      ["ES-BI", "Bizkaia"],
      ["ES-ZA", "Zamora"],
      ["ES-Z", "Zaragoza"],
      ["ES-CE", "Ceuta"],
      ["ES-ML", "Melilla"],
    ].map(([code, label]) => ({
      code,
      label: sameLabel(label),
    })),
  },

  PT: {
    label: {
      pt: "Distrito / Região Autónoma",
      es: "Distrito / Región Autónoma",
      en: "District / Autonomous Region",
    },

    areas: [
      ["PT-01", "Aveiro"],
      ["PT-02", "Beja"],
      ["PT-03", "Braga"],
      ["PT-04", "Bragança"],
      ["PT-05", "Castelo Branco"],
      ["PT-06", "Coimbra"],
      ["PT-07", "Évora"],
      ["PT-08", "Faro"],
      ["PT-09", "Guarda"],
      ["PT-10", "Leiria"],
      ["PT-11", "Lisboa"],
      ["PT-12", "Portalegre"],
      ["PT-13", "Porto"],
      ["PT-14", "Santarém"],
      ["PT-15", "Setúbal"],
      ["PT-16", "Viana do Castelo"],
      ["PT-17", "Vila Real"],
      ["PT-18", "Viseu"],
      ["PT-20", "Região Autónoma dos Açores"],
      ["PT-30", "Região Autónoma da Madeira"],
    ].map(([code, label]) => ({
      code,
      label: sameLabel(label),
    })),
  },

  GB: {
    label: {
      pt: "Nação",
      es: "Nación",
      en: "Nation",
    },

    areas: [
      {
        code: "GB-ENG",
        label: {
          pt: "Inglaterra",
          es: "Inglaterra",
          en: "England",
        },
      },
      {
        code: "GB-SCT",
        label: {
          pt: "Escócia",
          es: "Escocia",
          en: "Scotland",
        },
      },
      {
        code: "GB-WLS",
        label: {
          pt: "País de Gales",
          es: "Gales",
          en: "Wales",
        },
      },
      {
        code: "GB-NIR",
        label: {
          pt: "Irlanda do Norte",
          es: "Irlanda del Norte",
          en: "Northern Ireland",
        },
      },
    ],
  },
};

export function getAdministrativeAreaConfig(countryCode) {
  return ADMINISTRATIVE_AREAS[countryCode] ?? null;
}

export function isValidAdministrativeAreaCode(
  countryCode,
  administrativeAreaCode
) {
  const config = getAdministrativeAreaConfig(countryCode);

  if (!config) {
    return true;
  }

  return config.areas.some((area) => area.code === administrativeAreaCode);
}
