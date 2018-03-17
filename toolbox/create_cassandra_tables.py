from toolbox.cassandra_object_mapper_models import PlmnRaw
from toolbox.cassandra_object_mapper_models import PlmnRawCord
from toolbox.cassandra_object_mapper_models import PlmnProcessed
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from toolbox.cassandra_object_mapper_models import PlmnKeyNotFound
from toolbox.cassandra_object_mapper_models import PlmnBadEntries
from toolbox.cassandra_object_mapper_models import KpiUnits
from toolbox.cassandra_object_mapper_models import MissingKpis
from toolbox.cassandra_object_mapper_models import ClusterList
from cassandra.cqlengine import connection
from cassandra.cqlengine.management import sync_table


connection.setup(['127.0.0.1'], 'pb2')
sync_table(PlmnRaw)
sync_table(PlmnRawCord)
sync_table(PlmnProcessed)
sync_table(PlmnProcessedCord)
sync_table(PlmnKeyNotFound)
sync_table(PlmnBadEntries)
sync_table(KpiUnits)
sync_table(MissingKpis)
sync_table(ClusterList)