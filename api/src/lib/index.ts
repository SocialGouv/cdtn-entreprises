import { elasticsearchClient, ELASTICSEARCH_INDEX } from "../elastic";
import { entrepriseSearchBody, mapHit } from "../elastic/queries";

export const search = async (
  query: string,
  address: string | undefined,
  limit: number | undefined,
  addAllConventions: boolean,
  onlyWithConvention: boolean
) => {
  const body = entrepriseSearchBody(
    query,
    address,
    addAllConventions,
    onlyWithConvention,
    limit
  );

  const response = await elasticsearchClient.search({
    body,
    index: ELASTICSEARCH_INDEX,
  });

  //   console.log(JSON.stringify(body, null, 2));

  const entreprises = response.body.hits.hits.map(mapHit);

  //   console.log(JSON.stringify(entreprises, null, 2));

  return entreprises;
};

export const searchEntreprise = async (siren: string) => {
  const body = entrepriseSearchBody(siren, undefined, true, false, 1);

  const response = await elasticsearchClient.search({
    body,
    index: ELASTICSEARCH_INDEX,
  });

  const matches = response.body.hits.hits.map(mapHit);

  if (matches && matches.length >= 1) {
    return matches[0];
  } else {
    return undefined;
  }
};

export const searchEtablissement = async (siret: string) => {
  const body = entrepriseSearchBody(siret, undefined, false, false, 1);

  const response = await elasticsearchClient.search({
    body,
    index: ELASTICSEARCH_INDEX,
  });

  const matches = response.body.hits.hits.map(mapHit);

  if (matches && matches.length >= 1) {
    const etablissement = matches[0];

    // update some fields related to etablissement
    const convention = etablissement.conventions[0]
      ? etablissement.conventions[0]
      : undefined;
    delete etablissement.conventions;
    etablissement["convention"] = convention;
    etablissement.siret = etablissement.matchingEtablissement.siret;
    etablissement.address = etablissement.matchingEtablissement.address;
    delete etablissement.matchingEtablissement;

    return etablissement;
  } else {
    return undefined;
  }
};
