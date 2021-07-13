"""CDTN Entreprises data assembler

This script assembles data from different places and creates a new file that
will be used as source for our search index.

"""
import argparse
import pandas as pd
import numpy as np
from os import listdir
from os.path import isfile, join


def read_siren(stock_unite_legale_file):
    """ Read SIREN Stock Unite Legale

    Parameters
    ----------
    stock_unite_legale_file: str
        The location of the CSV or ZIP file

    Returns
    -------
    employeurs
        a Pandas dataframe containing the list of all companies that are still open
        and employ people
    """
    trancheEffectifsUniteLegale = "trancheEffectifsUniteLegale"
    categorieJuridiqueUniteLegale = "categorieJuridiqueUniteLegale"
    nomenclatureActivitePrincipaleUniteLegale = "nomenclatureActivitePrincipaleUniteLegale"
    categorieEntreprise = "categorieEntreprise"
    activitePrincipaleUniteLegale = "activitePrincipaleUniteLegale"

    selection = ["siren", "prenom1UniteLegale", "sigleUniteLegale", "nomUniteLegale", "nomUsageUniteLegale",
                 'denominationUniteLegale', "denominationUsuelle1UniteLegale", "denominationUsuelle2UniteLegale",
                 "denominationUsuelle3UniteLegale", activitePrincipaleUniteLegale,
                 trancheEffectifsUniteLegale, categorieJuridiqueUniteLegale,
                 nomenclatureActivitePrincipaleUniteLegale, categorieEntreprise]

    etatAdmin = "etatAdministratifUniteLegale"
    caractereEmployeur = "caractereEmployeurUniteLegale"

    # we only select columns in use and convert to categorical dtype
    # in order to decrease the dataframe memory footprint
    cols = selection + [etatAdmin, caractereEmployeur]
    raw = pd.read_csv(stock_unite_legale_file, usecols=cols,
                      dtype={ "siren": np.dtype(str), etatAdmin: "category", caractereEmployeur: "category",
                             trancheEffectifsUniteLegale: "category",
                             categorieJuridiqueUniteLegale: "category",
                             nomenclatureActivitePrincipaleUniteLegale: "category",
                             activitePrincipaleUniteLegale: "category",
                             categorieEntreprise: "category"}, )

    is_ouvert = raw[etatAdmin] == "A"
    is_employeur = raw[caractereEmployeur] == "O"
    is_admin = raw[etatAdmin] == "A"

    employeurs = raw[is_ouvert & is_employeur & is_admin]

    return employeurs[selection]


def read_geo(geo_directory):
    """ Read GEO data

    Parameters
    ----------
    geo_directory: str
        The directory containing geo data for all regions

    Returns
    -------
    all_geo
        a Pandas dataframe containing geo information for all open companies
    """
    geo_files = [f for f in listdir(
        geo_directory) if isfile(join(geo_directory, f))]
    geo_selection = ["enseigne1Etablissement", "enseigne2Etablissement", "enseigne3Etablissement", "denominationUsuelleEtablissement", "activitePrincipaleEtablissement",
                     'siren', 'siret', 'codePostalEtablissement', 'libelleCommuneEtablissement', "etatAdministratifEtablissement", "geo_adresse"]
    geo = {}
    for file in geo_files:
        geo[file] = pd.read_csv(
            geo_directory + file, dtype={"codePostalEtablissement": np.dtype(str),
                                         "etatAdministratifEtablissement": "category",
                                         "activitePrincipaleEtablissement": "category",
                                         "siret": np.dtype(str),
                                         "siren": np.dtype(str),
                                         }, usecols=geo_selection
        )

    all_geo = pd.concat(geo.values(), ignore_index=True).dropna(
        subset=['siret'])

    all_geo = all_geo.astype(dtype={"codePostalEtablissement": np.dtype(str),
                                    "etatAdministratifEtablissement": "category",
                                    "activitePrincipaleEtablissement": "category",
                                    "siret": np.dtype(str),
                                    "siren": np.dtype(str),
                                    })

    all_geo = all_geo[all_geo["etatAdministratifEtablissement"] == "A"]

    return all_geo


def read_idcc(idcc_file):
    """ Read IDCC data

    Parameters
    ----------
    idcc_file: str
        The location of the CSV file containing associations between companies and their "convention collectives", (aka WEEZ)

    Returns
    -------
    idccs
        a Pandas dataframe containing siret / idcc associations
    """
    idccs = pd.read_csv(idcc_file, dtype={"SIRET": np.dtype(str)}, usecols=["SIRET", "IDCC"]).rename(
        columns={"SIRET": "siret", "IDCC": "idcc"})
  
    return idccs


def assemble(siren, geo, idcc, output):
    sirenGeo = pd.merge(siren, geo, on='siren') 
    merged = pd.merge(sirenGeo, idcc, how='left', on='siret') 

    # add etablissement counts
    etsCounts = merged.siren.value_counts().rename_axis(
        'siren').reset_index(name='etablissements')
    withEts = pd.merge(merged, etsCounts, on='siren')

    # persits as CSV file
    withEts.astype({'idcc': 'Int64'}).to_csv(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        'siren_file',
        type=str,
        help="Location of the StockUniteLegale CSV or ZIP file"
    )
    parser.add_argument(
        'geo_directory',
        type=str,
        help="Location of the directory containing all the Geo CSV files"
    )
    parser.add_argument(
        'idcc_file',
        type=str,
        help="Location of the siret/idcc CSV file (aka WEEZ)"
    )
    parser.add_argument(
        'output_file',
        type=str,
        help="Location of the output file"
    )

    args = parser.parse_args()

    print("Read SIREN data")
    siren = read_siren(args.siren_file)

    print("Read GEO data")
    geo = read_geo(args.geo_directory)

    print("Read IDCC data")
    idcc = read_idcc(args.idcc_file)

    print("Assemble datasets")
    assemble(siren, geo, idcc, args.output_file)


if __name__ == "__main__":
    main()
