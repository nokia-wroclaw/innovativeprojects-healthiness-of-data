from cassandra.cluster import Cluster


# Function that creates a dictionary from data stored in cassandra table.
# @returns dictionary with kpi units and ranges
def cassandra_get_unit_data():
    kpi_dict = {}
    cassandra_cluster = Cluster()
    session = cassandra_cluster.connect('pb2')
    query = session.prepare('SELECT * FROM kpi_units')
    query_data = session.execute(query)
    for row in query_data:
        kpi_dict[row[0]] = [row[1], row[2], row[3]]

    return kpi_dict


# cassandra_get_unit_data()