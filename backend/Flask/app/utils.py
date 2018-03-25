from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import ClusterList
import datetime


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
