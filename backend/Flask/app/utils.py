import datetime
from collections import defaultdict

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
    connection.setup(['127.0.0.1'], 'pb2')
    cluster_array = ClusterList.objects.filter(acronym=cluster)
    return cluster_array


def parse_check_date(entry):
    """
    Parses and checks the entered date.
    :param entry: String with date
    :return: False if date not correct, else returns date
    """
    year, month, day = map(int, entry.split('-'))
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
    connection.setup(['127.0.0.1'], 'pb2')

    result = KpiUnits.objects.all()
    kpi_list = set()
    for row in result:
        kpi_list.add(row.kpi_basename)

    return list(kpi_list)


def get_acronym_list():
    """
    Gets all unique acronyms
    :return: Acronym list
    """
    connection.setup(['127.0.0.1'], 'pb2')

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
    connection.setup(['127.0.0.1'], 'pb2')

    result = ClusterList.objects.all()
    cord_dict = defaultdict(list)
    for row in result:
        cord_dict[row.cord_id].append(row.acronym)

    return cord_dict


def get_cord_id_list():
    cluster = Cluster(['127.0.0.1'])
    session = cluster.connect('pb2')
    session.row_factory = named_tuple_factory
    rows = session.execute("SELECT DISTINCT cord_id FROM plmn_processed_cord;")
    print(rows)
    cord_list = []
    i = 0
    for row in rows:
        cord_list.insert(i, str(row.cord_id))
        i += 1
        print(row.cord_id)
    cord_list.sort(key=int)
    print(cord_list)
    return cord_list
