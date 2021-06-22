import { Client, ClientOptions } from "@elastic/elasticsearch";
import { Enterprise, mapEnterprise, mappings } from "./enterprise";
import pAll from "p-all";

const ELASTICSEARCH_URL =
  process.env.ELASTICSEARCH_URL || "http://localhost:9200";
const API_KEY = process.env.ELASTICSEARCH_API_KEY;

const INDEX_NAME =
  process.env.ELASTICSEARCH_INDEX_NAME || "recherche-entreprises";
const indexPattern = `${INDEX_NAME}-*`;

const auth = API_KEY ? { apiKey: API_KEY } : undefined;

const esClientConfig: ClientOptions = {
  auth,
  node: ELASTICSEARCH_URL,
};

export const esClient = new Client(esClientConfig);

const analysis = {
  filter: {
    french_elision: {
      type: "elision",
      articles_case: true,
      articles: [
        "l",
        "m",
        "t",
        "qu",
        "n",
        "s",
        "j",
        "d",
        "c",
        "jusqu",
        "quoiqu",
        "lorsqu",
        "puisqu",
      ],
    },
    french_stop: {
      type: "stop",
      stopwords: "_french_",
    },
    french_stemmer: {
      type: "stemmer",
      language: "light_french",
    },
  },
  analyzer: {
    french_indexing: {
      tokenizer: "standard",
      filter: [
        "french_elision",
        "lowercase",
        // company labels do not include diatrics
        "asciifolding",
        "french_stop",
        "french_stemmer",
        // very important filter in order to remove duplication between
        // the different naming fields (nom, enseigne, denomination...)
        "unique",
      ],
    },
  },
};

const index = {
  similarity: {
    bm25_no_norm_length: {
      type: "BM25",
      b: 0,
    },
  },
};

export const deleteOldIndices = async (indexToKeep: string) => {
  const allIndices: string[] = await esClient.cat
    .indices({ format: "json" })
    .then(({ body }: { body: any }) =>
      body.map(({ index }: { index: string }) => index)
    );

  // list indices to delete
  const matchingIndices = allIndices.filter(
    (index) =>
      index.startsWith(indexPattern.substring(0, indexPattern.length - 2)) &&
      index != indexToKeep
  );

  const deletePromises = matchingIndices.map((index) =>
    esClient.indices.delete({ index })
  );

  await Promise.all(deletePromises)
    .then(() => console.log(`Indices deleted: ${matchingIndices}`))
    .catch(() =>
      console.error(`Error when trying to delete ${matchingIndices}`)
    );
};

export const updateAlias = (newIndexName: string) =>
  esClient.indices.updateAliases({
    body: {
      actions: [
        {
          remove: {
            alias: INDEX_NAME,
            index: indexPattern,
          },
        },
        {
          add: {
            alias: INDEX_NAME,
            index: newIndexName,
          },
        },
      ],
    },
  });

export const createIndex = async () => {
  const id = Math.floor(Math.random() * 10e8);
  const newIndexName = `${INDEX_NAME}-${id}`;
  const body = { mappings, settings: { analysis, index } };
  await esClient.indices.create({
    index: newIndexName,
    body,
  });
  return newIndexName;
};


export const getDocsCount = async (indexName: string): Promise<number> => {
  const stats = await esClient.indices.stats({ index: indexName });
  return stats.body._all.primaries.docs.count;
};
