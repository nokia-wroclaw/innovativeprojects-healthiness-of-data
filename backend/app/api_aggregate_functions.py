import datetime
import sys
import numpy
from collections import defaultdict
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessed
from backend.app.utils import parse_check_date
from backend.app.utils import fetch_cluster_cords
sys.path.append(sys.path[0] + "/../../")


def get_cord_data(start_date, end_date, kpi, cord, **options):
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
        return False    # Dates incorrect.
    else:
        # Get options
        histogram_bins = options.get('hist_bins')
        if not histogram_bins:
            histogram_bins = 10
        else:
            histogram_bins = int(histogram_bins)

        connection.setup(['127.0.0.1'], 'pb2')
        step = datetime.timedelta(days=1)
        values = []
        dates = []
        acronyms = set()

        while start_date < end_date:
            result = PlmnProcessed.objects.filter(kpi_basename=kpi).filter(date=start_date).filter(cord_id=cord)
            start_date += step
            for row in result:
                acronyms.add(row.acronym)
                values.append(row.value)
                dates.append(row.date.strftime('%d-%m-%Y')) # ZAMIAST TEGO MOZE BYc ZWYKlY LICZNIK dates += 1

        average = numpy.mean(values)
        max_value = max(values)
        min_value = min(values)
        coverage = len(dates)/(end_date - first_date).days/len(acronyms)
        deviation = numpy.std(values, ddof=1)
        temp = numpy.histogram(values, bins=histogram_bins)
        distribution = [temp[0].tolist(), temp[1].tolist()]

        data = {
                "cord_id": cord,
                "mean": average,
                "max_val": max_value,
                "min_val": min_value,
                "std_deviation": deviation,
                "coverage": coverage,
                "distribution": distribution
                }

        return data


def get_cluster_data(start_date, end_date, kpi, cord, acronym, **options):
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
        return False  # Dates incorrect.
    else:
        # Get options
        histogram_bins = options.get('hist_bins')
        if not histogram_bins:
            histogram_bins = 10
        else:
            histogram_bins = int(histogram_bins)

        connection.setup(['127.0.0.1'], 'pb2')
        step = datetime.timedelta(days=1)
        values = defaultdict(list)
        dates = defaultdict(list)

        while start_date < end_date:
            result = PlmnProcessed.objects.filter(kpi_basename=kpi).filter(date=start_date).\
                                           filter(cord_id=cord).filter(acronym=acronym)
            start_date += step
            for row in result:
                values[cord].append(row.value)
                dates[cord].append(row.date.strftime('%d-%m-%Y'))

        average = numpy.mean(values[cord])
        max_value = max(values[cord])
        min_value = min(values[cord])
        coverage = len(dates[cord]) / (end_date - first_date).days
        deviation = numpy.std(values[cord], ddof=1)
        temp = numpy.histogram(values[cord], bins=histogram_bins)
        distribution = [temp[0].tolist(), temp[1].tolist()]

        data = {
                "acronym": acronym,
                "cord_id": cord,
                "mean": average,
                "max_val": max_value,
                "min_val": min_value,
                "std_deviation": deviation,
                "coverage": coverage,
                "distribution": distribution
                }

        return data
