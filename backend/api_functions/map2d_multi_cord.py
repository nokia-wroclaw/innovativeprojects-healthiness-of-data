from __future__ import division

import datetime
import math
from collections import defaultdict

import numpy as np
import yaml
from cassandra.cqlengine import connection
from munkres import Munkres
from sklearn import manifold

from backend.api_functions.utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord


def generate_keys(cords):
    a = len(cords) - 1
    b = 0
    cord_keys = []
    for i in range(0, a):
        for j in range(b + 1, a + 1):
            key = cords[b] + '$' + cords[j]
            cord_keys.append(key)
            a -= 1
        b += 1
        a = len(cords) - 1
    return cord_keys


def get_map(start_date, end_date, kpi_basename, cord_list, date_other):
    """
    Function for finding outliers.
    :param start_date: Starting date.
    :param end_date: Ending date.
    :param kpi_basename: One kpi basename.
    :param cord_list: List of cord IDs.
    :param date_other: 3rd date to check past or future

    :return: correlation list, matrix, 2 acronym sets and result of hungarian algorithm
    """

    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    other_date = parse_check_date(date_other)

    all_date_days = (end_date - start_date).days
    if not start_date and not end_date:
        return {"error": "Incorrect dates."}, 400

    datasets = defaultdict(lambda: {"cord_id": '', "data": [], "acronym_set": []})
    datasets2 = defaultdict(lambda: {"cord_id": '', "data": [], "acronym_set": []})

    for cord in cord_list:
        data, acronym_set = fetch_data(start_date, end_date, cord, kpi_basename)
        datasets[cord]["cord_id"] = cord
        datasets[cord]["data"] = data
        datasets[cord]["acronym_set"] = acronym_set

        if other_date:
            if (start_date - other_date).days > 0:  # if it's before start
                data2, acronym_set2 = fetch_data(other_date, start_date, cord, kpi_basename)
                all_date_days2 = (start_date - other_date).days
            elif (other_date - end_date).days > 0:  # if it's after end
                data2, acronym_set2 = fetch_data(end_date, other_date, cord, kpi_basename)
                all_date_days2 = (other_date - end_date).days
            datasets2[cord]["cord_id"] = cord
            datasets2[cord]["data"] = data2
            datasets2[cord]["acronym_set"] = acronym_set2

    fin1 = get_all_but_mds(cord_list, datasets, all_date_days)
    fin = {}
    if not other_date:
        fin = {
            'matrix_full': fin1['matrix_full'],
            'matrix_totals': fin1['matrix_totals'],
            'positions': get_mds(fin1['matrix_totals'])
        }
    else:
        fin2 = get_all_but_mds(cord_list, datasets2, all_date_days2)
        fin = {
            'matrix_full': fin1['matrix_full'],
            'matrix_totals': fin1['matrix_totals'],
            'positions': get_mds(fin1['matrix_totals']),
            'heatmap': get_heatmap(fin2['matrix_totals'], fin1['matrix_totals'])
        }

    return fin, 200


def get_all_but_mds(cord_list, datasets, all_date_days):
    fin_list = []
    a = len(cord_list) - 1
    b = 0
    for i in range(0, a):
        for j in range(b + 1, a + 1):
            fin_list.append(get_correlation(datasets[cord_list[b]], datasets[cord_list[j]], all_date_days))
            a -= 1
        b += 1
        a = len(cord_list) - 1
    matrix_totals = [[0 for x in range(len(cord_list))] for y in range(len(cord_list))]
    matrix_full = [[0 for x in range(len(cord_list))] for y in range(len(cord_list))]
    pos = 0
    for a in range(0, len(cord_list)):
        for b in range(0, len(cord_list)):
            if a == b:
                matrix_totals[a][b] = 0.0
                matrix_full[a][b] = 'x'
            elif a < b:
                matrix_totals[a][b] = fin_list[pos]['total']
                matrix_totals[b][a] = fin_list[pos]['total']
                matrix_full[a][b] = fin_list[pos]
                matrix_full[b][a] = fin_list[pos]
                pos += 1

    fin = {
        'matrix_full': matrix_full,
        'matrix_totals': matrix_totals
    }

    return fin


def get_correlation(data1, data2, all_date_days):
    coverage_cutoff = 0.0
    ready_data = {}
    acronym_set = data1['acronym_set']
    acronym_set2 = data2['acronym_set']
    empty_matrix = [[0 for x in range(len(acronym_set))] for y in range(len(acronym_set2))]
    empty_matrix_val = [[0 for x in range(len(acronym_set))] for y in range(len(acronym_set2))]
    for acronym in acronym_set:
        for acronym2 in acronym_set2:
            cov = len(data1['data'][acronym]['dates']) / all_date_days
            cov2 = len(data2['data'][acronym2]['dates']) / all_date_days
            if cov > coverage_cutoff and cov2 > coverage_cutoff:
                ready_data[acronym + '$' + acronym2] = {
                    "dataset1": data1['data'][acronym],
                    "dataset2": data2['data'][acronym2],
                    'coverage1': cov,  # NOWE
                    'coverage2': cov2  # NOWE
                }
    print(data1['cord_id'] + '$' + data2['cord_id'])
    clusters_correlation = norma_L(ready_data, empty_matrix, empty_matrix_val)
    total = hungarian(clusters_correlation['matrix'], clusters_correlation['matrix_val']
                      )  # NOWE TU TRZEBA MU PRZEKAZAĆ JAKO ARGUMENT COVERAGE KAŻDEGO AKRONIMU (ALBO SUME
    full_data = {
        'cord_key': data1['cord_id'] + '$' + data2['cord_id'],
        'matrix': clusters_correlation['matrix'],
        'acronym_set1': list(acronym_set),
        'acronym_set2': list(acronym_set2),
        'total': total
    }
    return full_data


def norma_L(ready_data, matrix, matrix_val):
    clusters_correlation = []
    for key in ready_data:
        dataset1 = ready_data[key]['dataset1']
        dataset2 = ready_data[key]['dataset2']
        temp_sum = 0
        number_of_points = 0
        for i in range(min(len(dataset1['values']), len(dataset2['values']))):
            if dataset1['dates'][i] == dataset2['dates'][i]:
                temp_sum = temp_sum + (dataset1['values'][i] - dataset2['values'][i]) ** 2
                number_of_points += 1  # NOWE
        if number_of_points == 0:
            print(key)
            print(len(dataset1['values']))
            print(dataset1['values'])
            print(len(dataset2['values']))
            print(dataset2['values'])
            number_of_points = 0.000000001
            temp_sum = 100000000.0
        keys = key.split('$')
        clusters_correlation.append({
            "acronym1": keys[0],
            "acronym2": keys[1],
            "value": math.sqrt(temp_sum) / number_of_points,  # NOWE
            'coverage1': ready_data[key]['coverage1'],  # NOWE
            'coverage2': ready_data[key]['coverage2']  # NOWE
        })
    pos = 0
    for a in range(len(matrix)):
        for b in range(len(matrix[0])):
            matrix[a][b] = clusters_correlation[pos]
            matrix_val[a][b] = clusters_correlation[pos]['value']
            pos += 1
    matrixes = {
        'matrix': matrix,
        'matrix_val': matrix_val
    }
    return matrixes


def hungarian(matrix, matrix_val):
    if len(matrix_val) == 0:
        print(matrix_val)
        print(len(matrix_val))
        return -1
    m = Munkres()
    indexes = m.compute(matrix_val)
    total = 0
    coverage_sum = 0
    for row, column in indexes:
        value = matrix_val[row][column]
        total += (value * ((matrix[row][column]['coverage1'] + matrix[row][column]['coverage1']) / 2))
        coverage_sum += matrix[row][column]['coverage1'] + matrix[row][column]['coverage2']
    if coverage_sum == 0:
        return -2
    return total / coverage_sum  # NOWE, TU JESZCZE TRZEBA PODZIELIC PRZEZ SUME COVERAGY


def get_mds(sym_matrix):
    arr = np.array(sym_matrix)
    mds = manifold.MDS(n_components=2, max_iter=3000, eps=1e-9,
                       dissimilarity="precomputed", n_jobs=1)

    wrong_format_array = mds.fit(arr).embedding_
    positions = []
    # nmds = manifold.MDS(n_components=2, metric=False, max_iter=3000, eps=1e-12,
    #                     dissimilarity="precomputed", n_jobs=1,
    #                     n_init=1)
    # npos = nmds.fit_transform(arr, init=wrong_format_array)
    for m in range(0, len(wrong_format_array)):
        positions.append({
            'x': wrong_format_array[m, 0], 'y': wrong_format_array[m, 1]
        })
    return positions


def get_heatmap(older_matrix, newer_matrix):
    heatmap = [[0 for x in range(len(older_matrix))] for y in range(len(older_matrix))]
    for i in range(0, len(older_matrix)):
        for j in range(0, len(older_matrix)):
            if i < j and older_matrix[i][j] != 0.0:
                val = (newer_matrix[i][j] - older_matrix[i][j]) / older_matrix[i][j]
                heatmap[i][j] = val
                heatmap[j][i] = val

    return heatmap


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
