import datetime
from collections import defaultdict

import yaml
from cassandra.cluster import Cluster
from cassandra.cqlengine import connection
from cassandra.query import named_tuple_factory

from toolbox.cassandra_object_mapper_models import ClusterList
from toolbox.cassandra_object_mapper_models import KpiUnits


def fetch_cluster_cords(cluster):
    """
    This function is needed when one cluster belongs to multiple operators. Returns all cords the acronym belongs to.
    :param cluster: cluster name, acronym
    :return: array of objects with provided cluster
    """
    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])
    cluster_array = ClusterList.objects.filter(acronym=cluster)
    return cluster_array


def parse_check_date(entry):
    """
    Parses and checks the entered date.
    :param entry: String with date
    :return: False if date not correct, else returns date
    """
    try:
        year, month, day = map(int, entry.split('-'))
    except AttributeError:
        return False

    try:
        new_date = datetime.datetime(year, month, day)
        return new_date
    except ValueError:
        print('Bad date')
        return False
    except:
        print('Unknown exception')
        return False


def get_kpi_list():
    """
    Gets existing kpi list
    :return: Kpi as list
    """
    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])

    result = KpiUnits.objects.all()
    kpi_list = set()
    for row in result:
        kpi_list.add(row.kpi_basename.upper())

    return list(kpi_list)


def get_acronym_list():
    """
    Gets all unique acronyms
    :return: Acronym list
    """
    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])

    result = ClusterList.objects.all()
    acronym_set = set()
    for row in result:
        acronym_set.add(row.acronym)

    return list(acronym_set)


def get_cord_acronym_set():
    """
    Gets all cords and acronyms that belong to it.
    :return: Cord: acronyms dictionary
    """
    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])

    result = ClusterList.objects.all()
    cord_dict = defaultdict(list)
    for row in result:
        cord_dict[row.cord_id].append(row.acronym)

    return cord_dict


def get_cord_id_list():
    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    cluster = Cluster([config['address']])
    session = cluster.connect(config['keyspace'])
    session.row_factory = named_tuple_factory
    rows = session.execute("SELECT DISTINCT cord_id FROM plmn_processed_cord;")
    cord_list = []
    i = 0
    for row in rows:
        cord_list.insert(i, str(row.cord_id))
        i += 1
    return cord_list
