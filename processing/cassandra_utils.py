"""
This module will be interfacing db for data mining
"""
from cassandra.cluster import Cluster

def cassandra_get_unit_data():
    """
    Basing function to obtain units from db and return as dict
    :return: dictionary of units
    """
    kpi_dict = {}
    cassandra_cluster = Cluster()
    session = cassandra_cluster.connect('pb2')
    query = session.prepare('SELECT * FROM kpi_units')
    query_data = session.execute(query)
    for row in query_data:
        kpi_dict[row[1]] = [row[0], row[2], row[3], row[4]]

    return kpi_dict
