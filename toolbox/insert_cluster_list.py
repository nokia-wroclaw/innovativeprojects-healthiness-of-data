from toolbox.cassandra_object_mapper_models import ClusterList
import csv
from cassandra.cqlengine import connection

"""
RUNNING THIS FILE WILL INSERT ALL CLUSTER DATA FROM clusters.csv INTO THE DATABASE
"""

cluster_list_file = 'clusters.csv'


def insert_cluster_list():
    connection.setup(['127.0.0.1'], 'pb2')
    with open(cluster_list_file, 'r') as row:
        reader = csv.reader(row)
        for readerRow in reader:
            ClusterList.create(acronym=readerRow[1], cord_id=readerRow[0])


insert_cluster_list()