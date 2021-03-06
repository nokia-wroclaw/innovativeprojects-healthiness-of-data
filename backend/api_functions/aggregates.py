import datetime
import numpy
import yaml
from collections import defaultdict
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessed
from .utils import parse_check_date


def calculate_operator_aggregates(start_date, end_date, kpi, cord, **options):
    """
    Calculates all aggregates.
    :param start_date: beginning date of range
    :param end_date: ending date of range
    :param kpi: kpi_basename
    :param cord: operator number
    :param options: either cord or acr - depending on which one is provided different aggregates are calculated
    :return: False if no data is found, else returns data and calculated aggregates
    """
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    first_date = start_date
    if not start_date and not end_date:
        return {"error": "Incorrect dates."}, 400

    histogram_bins = options.get('hist_bins')
    if not histogram_bins:
        histogram_bins = 10
    else:
        histogram_bins = int(histogram_bins)

    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])
    step = datetime.timedelta(days=1)
    values = []
    dates = []
    acronyms = set()
    kpi = kpi.upper()

    while start_date < end_date:
        result = PlmnProcessed.objects.filter(kpi_basename=kpi).filter(date=start_date).filter(cord_id=cord)
        start_date += step
        for row in result:
            acronyms.add(row.acronym)
            values.append(row.value)
            dates.append(row.date.strftime('%d-%m-%Y'))

    if not len(values):
        return {"error": "No data found for given parameters."}, 400

    average = numpy.mean(values)
    max_value = max(values)
    min_value = min(values)
    coverage = len(dates) * 1.0 /(end_date - first_date).days/len(acronyms)
    deviation = numpy.std(values, ddof=1)
    temp = numpy.histogram(values, bins=histogram_bins)
    distribution = [temp[0].tolist(), temp[1].tolist()]

    data = {
            "cord_id": cord,
            "kpi_basename": kpi,
            "mean": average,
            "max_val": max_value,
            "min_val": min_value,
            "std_deviation": deviation,
            "coverage": coverage,
            "distribution": distribution
            }

    return data, 200


def calculate_cluster_aggregates(start_date, end_date, kpi, cord, acronym, **options):
    """
    Calculates all aggregates.
    :param start_date: beginning date of range
    :param end_date: ending date of range
    :param kpi: kpi_basename
    :param acronym: cluster name
    :param options: either cord or acr - depending on which one is provided different aggregates are calculated
    :return: False if no data is found, else returns data and calculated aggregates
    """
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    first_date = start_date
    if not start_date and not end_date:
        return {"error": "Incorrect dates."}, 400

    histogram_bins = options.get('hist_bins')
    if not histogram_bins:
        histogram_bins = 10
    else:
        histogram_bins = int(histogram_bins)

    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])
    step = datetime.timedelta(days=1)
    values = []
    dates = []
    kpi = kpi.upper()

    while start_date < end_date:
        result = PlmnProcessed.objects.filter(kpi_basename=kpi).filter(date=start_date).\
                                       filter(cord_id=cord).filter(acronym=acronym)
        start_date += step
        for row in result:
            values.append(row.value)
            dates.append(row.date.strftime('%d-%m-%Y'))

    if not len(values):
        return {"error": "No data found for given parameters."}, 400

    average = numpy.mean(values)
    max_value = max(values)
    min_value = min(values)
    coverage = len(dates) * 1.0 / (end_date - first_date).days
    deviation = numpy.std(values, ddof=1)
    temp = numpy.histogram(values, bins=histogram_bins)
    distribution = [temp[0].tolist(), temp[1].tolist()]

    data = {
            "cord_id": cord,
            "acronym": acronym,
            "kpi_basename": kpi,
            "mean": average,
            "max_val": max_value,
            "min_val": min_value,
            "std_deviation": deviation,
            "coverage": coverage,
            "distribution": distribution
            }

    return data, 200
