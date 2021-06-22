import Router from "koa-router";
import { search, searchEntreprise, searchEtablissement } from "../lib";

import pkg from "../../package.json";

export const router = new Router();

export const API_PREFIX = "/api/v1";

router.get(`${API_PREFIX}/search`, async (ctx) => {
  const {
    q: query,
    a: address,
    l: limit,
    onlyWithConvention,
    collapseSiren,
  } = ctx.query;

  if (!query) {
    ctx.throw(400, `query parameter q is required`);
  }

  try {
    const entreprises = await search({
      query: query as string,
      address: address as string,
      limit: parseInt(limit as string),
      onlyWithConvention: onlyWithConvention === "true",
      collapseSiren: collapseSiren === "true",
    });
    ctx.body = { entreprises };
  } catch (err) {
    console.log(JSON.stringify(err));
    ctx.throw(500);
  }
});

const siretRE = new RegExp(/^\d{14}$/);
const validateSiretFormat = (siret: string) => siret.match(siretRE);

router.get(`${API_PREFIX}/etablissement/:siret`, async (ctx) => {
  const { siret } = ctx.params;

  if (!siret) {
    ctx.throw(400, "siret required");
  } else if (!validateSiretFormat(siret)) {
    ctx.throw(400, "invalid siret");
  }

  try {
    const etablissement = await searchEtablissement(siret as string);
    if (etablissement) {
      ctx.body = etablissement;
    } else {
      ctx.throw(404);
    }
  } catch (err) {
    if (err.status) {
      throw err;
    } else {
      console.log(JSON.stringify(err));
      ctx.throw(500);
    }
  }
});

const sirenRE = new RegExp(/^\d{9}$/);
const validateSirenFormat = (siren: string) => siren.match(sirenRE);

router.get(`${API_PREFIX}/entreprise/:siren`, async (ctx) => {
  const { siren } = ctx.params;

  if (!siren) {
    ctx.throw(400, "siren required");
  } else if (!validateSirenFormat(siren)) {
    ctx.throw(400, "invalid siren");
  }

  try {
    const entreprise = await searchEntreprise(siren as string);
    if (entreprise) {
      ctx.body = entreprise;
    } else {
      ctx.throw(404);
    }
  } catch (err) {
    if (err.status) {
      throw err;
    } else {
      console.log(JSON.stringify(err));
      ctx.throw(500);
    }
  }
});

// kubernetes probe
router.get(`/healthz`, (ctx) => {
  ctx.body = { hello: "world" };
});

router.get(`/`, (ctx) => {
  ctx.body = {
    success: true,
    version: pkg.version,
    about: "https://github.com/SocialGouv/recherche-entreprises",
  };
});
