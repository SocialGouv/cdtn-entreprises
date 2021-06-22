# API recherche d'entreprises

Exemple d'API qui exploite l'index ElasticSearch [recherche-entreprises](https://github.com/socialgouv/recherche-entreprises)

```sh
yarn install
yarn build
ELASTICSEARCH_URL=http://localhost:9200 ELASTICSEARCH_API_KEY=key yarn start
```

## **Generic search**

---

Returns json data about companies matching search parameters

- **URL**

  /api/v1/search

- **Method:**

  `GET`

- **Query Params**

  **Required:**

  `q=[string]` query used to perform the search on company names

  **Optional:**

  `a=[string]` city or postal code

  `l=[integer]` result limit

  `collapseSiren=[true|false]` return all conventions for a matching enterprise

  `onlyWithConvention=[true|false]` only return enterprises with an associated agreement

- **Sample Call:**

  ```sh
  curl --request GET --url 'http://localhost:3000/api/v1/search?q=michelin&a=clermont&l=3'
  ```

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    ```json
    {
      "entreprises": [
        {
          "activitePrincipale": "Fabrication et rechapage de pneumatiques",
          "conventions": [
            {
              "idcc": 1486,
              "shortTitle": "Bureaux d'études techniques, cabinets d'ingénieurs-conseils et sociétés de conseils"
            }
          ],
          "etablissements": 28,
          "highlightLabel": "MANUF FRANC PNEUMATIQ <b><u>MICHELIN</b></u>",
          "label": "MANUF FRANC PNEUMATIQ MICHELIN",
          "matching": 1,
          "simpleLabel": "MANUF FRANC PNEUMATIQ MICHELIN",
          "siren": "855200507",
          "matchingEtablissement": {
            "siret": "85520050700017",
            "address": "23 Place des Carmes Dechaux 63000 Clermont-Ferrand"
          }
        },
        {
          "activitePrincipale": "Accueil de jeunes enfants",
          "conventions": [
            {
              "idcc": 29,
              "shortTitle": "Hospitalisation privée : établissements privés d'hospitalisation, de soins, de cure et de garde à but non lucratif (FEHAP)"
            }
          ],
          "etablissements": 3,
          "highlightLabel": "SOHPEM SOC OEUVRES HYGIENE <b><u>MICHELIN</b></u> MULTI-ACCUEIL LES 3 RECRES",
          "label": "SOHPEM SOC OEUVRES HYGIENE MICHELIN MULTI-ACCUEIL LES 3 RECRES",
          "matching": 3,
          "simpleLabel": "SOC OEUVRES HYGIENE MICHELIN",
          "siren": "857201727",
          "matchingEtablissement": {
            "siret": "85720172700172",
            "address": "19 Rue de Bien - Assis 63100 Clermont-Ferrand"
          }
        },
        {
          "activitePrincipale": "Transports aériens de passagers",
          "conventions": [
            {
              "idcc": 45,
              "shortTitle": "Caoutchouc"
            }
          ],
          "etablissements": 3,
          "highlightLabel": "<b><u>MICHELIN</b></u> AIR SERVICES",
          "label": "MICHELIN AIR SERVICES",
          "matching": 1,
          "simpleLabel": "MICHELIN AIR SERVICES",
          "siren": "414746503",
          "matchingEtablissement": {
            "siret": "41474650300013",
            "address": "23 Place des Carmes Dechaux 63000 Clermont-Ferrand"
          }
        }
      ]
    }
    ```

## **Entreprise**

---

Returns entreprise details for a given **siren**

- **URL**

  /api/v1/entreprise/:siren

- **Method:**

  `GET`

- **URL Params**

  **Required:**

  `siren=[string]` company SIREN (9 digits)

- **Sample Call:**

  ```sh
  curl --request GET --url 'http://localhost:3000/api/v1/entreprise/855200507'
  ```

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    ```json
    {
      "activitePrincipale": "Fabrication et rechapage de pneumatiques",
      "conventions": [
        {
          "idcc": 45,
          "shortTitle": "Caoutchouc"
        },
        {
          "idcc": 1486,
          "shortTitle": "Bureaux d'études techniques, cabinets d'ingénieurs-conseils et sociétés de conseils"
        }
      ],
      "etablissements": 28,
      "highlightLabel": "MANUF FRANC PNEUMATIQ MICHELIN",
      "label": "MANUF FRANC PNEUMATIQ MICHELIN",
      "matching": 26,
      "simpleLabel": "MANUF FRANC PNEUMATIQ MICHELIN",
      "siren": "855200507",
      "matchingEtablissement": {
        "siret": "85520050700454",
        "address": "Rue de Cataroux 63100 Clermont-Ferrand"
      }
    }
    ```

## **Etablissement**

---

Returns etablissement details for a given **siret**

- **URL**

  /api/v1/etablissement/:siret

- **Method:**

  `GET`

- **URL Params**

  **Required:**

  `siret=[string]` company SIRET (14 digits)

- **Sample Call:**

  ```sh
  curl --request GET --url 'http://localhost:3000/api/v1/etablissement/85520050700710'
  ```

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    ```json
    {
      "activitePrincipale": "Fabrication et rechapage de pneumatiques",
      "address": "16 Rue de Toutlemonde 49300 Cholet",
      "etablissements": 28,
      "highlightLabel": "MANUF FRANC PNEUMATIQ MICHELIN",
      "label": "MANUF FRANC PNEUMATIQ MICHELIN",
      "matching": 1,
      "simpleLabel": "MANUF FRANC PNEUMATIQ MICHELIN",
      "siren": "855200507",
      "convention": {
        "idcc": 45,
        "shortTitle": "Caoutchouc"
      },
      "siret": "85520050700710"
    }
    ```
