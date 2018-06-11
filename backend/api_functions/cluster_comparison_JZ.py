import datetime
import math
from collections import defaultdict

from munkres import Munkres, print_matrix
import yaml
from cassandra.cqlengine import connection

from backend.api_functions.utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord


def cluster_comparasion(start_date, end_date, cord_id1, cord_id2, kpi_basename):
    """
    Function for finding outliers.
    :param start_date: Starting date.
    :param end_date: Ending date.
    :param kpi_basename: One kpi basename.
    :param cord_id1: Operator 1 cord id.
    :param cord_id2: Operator 2 cord id.

    :return: shiet for now
    """
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)

    if not start_date and not end_date:
        return {"error": "Incorrect dates."}, 400

    all_date_days = (end_date - start_date).days
    data, acronym_set = fetch_data(start_date, end_date, cord_id1, kpi_basename)
    data2, acronym_set2 = fetch_data(start_date, end_date, cord_id2, kpi_basename)

    print(acronym_set)
    print(acronym_set2)
    rows = len(acronym_set)
    cols = len(acronym_set2)
    print(rows)
    print(cols)
    mati = [[0 for x in range(cols)] for y in range(rows)]
    print(mati)

    coverage_cutoff = 0.0
    ready_data = {}
    for acronym in acronym_set:
        for acronym2 in acronym_set2:
            cov = len(data[acronym]['dates']) / all_date_days
            cov2 = len(data2[acronym2]['dates']) / all_date_days
            if cov > coverage_cutoff and cov2 > coverage_cutoff:
                ready_data[acronym + '$' + acronym2] = {
                    "dataset1": data[acronym],
                    "dataset2": data2[acronym2],
                }
    clusters_correlation = wzorek_wojtka(ready_data, mati)
    print('cluster correlation')
    print(clusters_correlation)
    total = hungarian(clusters_correlation['matrix'])
    print(total)
    full_data = {
        'correlation_list': clusters_correlation['correlation_list'],
        'matrix': clusters_correlation['matrix'],
        'total': total,
        'acrs1': list(acronym_set),
        'acrs2': list(acronym_set2)
    }
    return full_data, 200


def wzorek_wojtka(ready_data, matrix):
    clusters_correlation = []
    for key in ready_data:
        dataset1 = ready_data[key]['dataset1']
        dataset2 = ready_data[key]['dataset2']
        temp_sum = 0
        for i in range(min(len(dataset1['values']), len(dataset2['values']))):
            if dataset1['dates'][i] == dataset2['dates'][i]:
                temp_sum = temp_sum + (dataset1['values'][i] - dataset2['values'][i]) ** 2
        keys = key.split('$')
        clusters_correlation.append({
            "acronym1": keys[0],
            "acronym2": keys[1],
            "value": math.sqrt(temp_sum)
        })
    pos = 0
    for a in range(len(matrix)):
        for b in range(len(matrix[0])):
            matrix[a][b] = clusters_correlation[pos]['value']
            pos += 1
    print(matrix)
    data_with_matrix = {
        'correlation_list': clusters_correlation,
        'matrix': matrix
    }
    return data_with_matrix


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


def hungarian(matrix):
    m = Munkres()
    indexes = m.compute(matrix)
    print_matrix(matrix, msg='Lowest cost')
    total = 0
    for row, column in indexes:
        value = matrix[row][column]
        total += value
        # print('(%d, %d) -> %d' % (row, column, value))
        # print('total cost: %d' % total)
    return total



