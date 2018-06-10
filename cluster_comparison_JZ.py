import numpy
import datetime
import yaml
import math
from collections import defaultdict
from cassandra.cqlengine import connection
from backend.api_functions.utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from matplotlib import pyplot


def wzorek_wojtka(ready_data):
    clusters_correlation = {}
    for key in ready_data:
        dataset1 = ready_data[key]['dataset1']
        dataset2 = ready_data[key]['dataset2']
        temp_sum = 0
        for i in range(min(len(dataset1['values']), len(dataset2['values']))):
            if dataset1['dates'][i] == dataset2['dates'][i]:
                temp_sum = temp_sum + (dataset1['values'][i] - dataset2['values'][i]) ** 2
        clusters_correlation[key] = math.sqrt(temp_sum)
    return clusters_correlation


def fetch_data(start_date, end_date, cord_id, kpi_basename):
    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])
    step = datetime.timedelta(days=1)

    data = defaultdict(lambda: {"values": [], "dates": []})
    acronym_set = set()

    while start_date < end_date:
        result = PlmnProcessedCord.objects.filter(kpi_basename=kpi_basename).filter(date=start_date).filter(
            cord_id=cord_id)
        start_date += step
        for row in result:
            data[row.acronym]["values"].append(row.value)
            data[row.acronym]["dates"].append(row.date)
            acronym_set.add(row.acronym)

    return data, acronym_set


start = datetime.datetime(2017, 9, 1)
end = datetime.datetime(2017, 12, 1)
all_date_days = (end - start).days
data, acronym_set = fetch_data(start, end, 'Skuntank', 'RNC_31')
data2, acronym_set2 = fetch_data(start, end, 'Magby', 'RNC_31')

print(data)
print(acronym_set)
print(data2)
print(acronym_set2)

coverage_cutoff = 0.8
ready_data = {}
for acronym in acronym_set:
    for acronym2 in acronym_set2:
        cov = len(data[acronym]['dates']) / all_date_days
        cov2 = len(data2[acronym2]['dates']) / all_date_days
        print(len(data[acronym]['dates']))
        print(len(data[acronym]['dates']))
        print(cov)
        print(cov2)
        if cov > coverage_cutoff and cov2 > coverage_cutoff:
            ready_data[acronym + '$' + acronym2] = {
                "dataset1": data[acronym],
                "dataset2": data2[acronym2],
            }

    clusters_correlation = wzorek_wojtka(ready_data)

    print('cluster correlation')
    print(clusters_correlation)
    # kpi_list = list(ready_data.keys())
    #
    # fig = pyplot.figure()
    # for i in range(1, 10):
    #     ax = fig.add_subplot(3, 3, i)
    #     ax.plot(ready_data[kpi_list[i]]['dataset1']['dates'], ready_data[kpi_list[i]]['dataset1']['values'])
    #     ax.plot(ready_data[kpi_list[i]]['dataset2']['dates'], ready_data[kpi_list[i]]['dataset2']['values'])
    #
    #     fig.suptitle('Window size:')
    #
    # pyplot.show()
