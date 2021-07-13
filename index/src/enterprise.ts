import { codesNaf } from "./naf";
import agreements from "@socialgouv/kali-data/data/index.json";

const ccMap = new Map(agreements.map((agg) => [agg.num, agg]));

export type Enterprise = {
  siren: string;
  trancheEffectifsUniteLegale: number;

  // categorieEntreprise: 'PME',
  prenom1UniteLegale: string;
  nomUniteLegale: string;
  nomUsageUniteLegale: string;
  sigleUniteLegale: string;

  denominationUniteLegale: string;
  denominationUsuelle1UniteLegale: string;
  denominationUsuelle2UniteLegale: string;
  denominationUsuelle3UniteLegale: string;

  enseigne1Etablissement: string;
  enseigne2Etablissement: string;
  enseigne3Etablissement: string;
  denominationUsuelleEtablissement: string;

  etablissements: number;

  // categorieJuridiqueUniteLegale: '5599',
  activitePrincipaleUniteLegale: string;
  activitePrincipaleEtablissement: string;

  // nomenclatureActivitePrincipaleUniteLegale: 'NAFRev2',
  siret: string;
  codePostalEtablissement: string;
  libelleCommuneEtablissement: string;

  // etatAdministratifEtablissement: 'A',
  // MOIS: '2020-07',

  idcc: string | undefined;
  geo_adresse: string;

  // DATE_MAJ: '2020/08/28'
};

export const mappings = {
  properties: {
    trancheEffectifsUniteLegale: { type: "rank_feature" },
    siretRank: { type: "rank_feature" },
    etablissements: { type: "rank_feature" },

    siret: { type: "keyword" },
    siren: { type: "keyword" },
    codePostalEtablissement: { type: "keyword" },
    libelleCommuneEtablissement: { type: "keyword" },

    prenom1UniteLegale: { type: "keyword" },
    nomUniteLegale: { type: "keyword" },
    nomUsageUniteLegale: { type: "keyword" },
    sigleUniteLegale: { type: "keyword" },

    denominationUniteLegale: { type: "keyword" },
    denominationUsuelle1UniteLegale: { type: "keyword" },
    denominationUsuelle2UniteLegale: { type: "keyword" },
    denominationUsuelle3UniteLegale: { type: "keyword" },

    enseigne1Etablissement: { type: "keyword" },
    enseigne2Etablissement: { type: "keyword" },
    enseigne3Etablissement: { type: "keyword" },
    denominationUsuelleEtablissement: { type: "keyword" },

    withIdcc: { type: "boolean" },
    idcc: {
      type: "keyword",
      fields: {
        number: {
          type: "integer",
        },
      },
    },

    cp: { type: "keyword" },

    ville: {
      analyzer: "french_indexing",
      type: "text",
    },

    address: {
      analyzer: "french_indexing",
      type: "text",
    },

    naming: {
      analyzer: "french_indexing",
      type: "text",
      similarity: "bm25_no_norm_length",
    },

    activitePrincipale: { type: "keyword" },
    convention: { type: "keyword" },
  },
};

export const mapEnterprise = (enterprise: Enterprise) => {
  // ranking feature cannot be 0
  if (
    !Number.parseFloat(
      enterprise.trancheEffectifsUniteLegale as unknown as string
    )
  ) {
    enterprise.trancheEffectifsUniteLegale = 0.1;
  }

  const siretRank = enterprise.siret;

  const naming = Array.from(
    new Set([
      enterprise.prenom1UniteLegale,
      enterprise.nomUniteLegale,
      enterprise.nomUsageUniteLegale,
      enterprise.sigleUniteLegale,

      enterprise.denominationUniteLegale,
      enterprise.denominationUsuelle1UniteLegale,
      enterprise.denominationUsuelle2UniteLegale,
      enterprise.denominationUsuelle3UniteLegale,

      enterprise.enseigne1Etablissement,
      enterprise.enseigne2Etablissement,
      enterprise.enseigne3Etablissement,
      enterprise.denominationUsuelleEtablissement,
    ])
  )
    .filter((t) => t)
    .join(" ");

  const codeActivitePrincipale = [
    enterprise.activitePrincipaleEtablissement,
    enterprise.activitePrincipaleUniteLegale,
  ]
    .map((code) => code.replace(/\w$/, ""))
    .find((s) => !s.startsWith("00.00")); // 00.00Z is a temporary code

  const activitePrincipale =
    codeActivitePrincipale !== undefined
      ? codesNaf.get(codeActivitePrincipale)
      : undefined;

  const convention = enterprise.idcc
    ? ccMap.get(parseInt(enterprise.idcc))?.shortTitle
    : undefined;

  const withIdcc =
    (enterprise.idcc &&
      parseInt(enterprise.idcc) !== 0 &&
      parseInt(enterprise.idcc) !== 9999) ||
    false;

  return {
    address: enterprise.geo_adresse,
    cp: enterprise.codePostalEtablissement || undefined,
    ville: enterprise.libelleCommuneEtablissement,
    naming,
    activitePrincipale,
    convention,
    withIdcc,
    siretRank,
    ...Object.fromEntries(
      Object.entries(enterprise).filter(([k, v]) => k && v)
    ),
  };
};
