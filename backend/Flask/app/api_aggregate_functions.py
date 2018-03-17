import datetime
import sys
import numpy
from collections import defaultdict
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessed
from backend.Flask.app.utils import parse_check_date
from backend.Flask.app.utils import fetch_cluster_cords
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
        acronyms = set()
        values = defaultdict(list)
        dates = defaultdict(list)

        while start_date < end_date:
            result = PlmnProcessed.objects.filter(kpi_basename=kpi).filter(date=start_date).filter(cord_id=cord)
            start_date += step
            for row in result:
                acronyms.add(row.acronym)
                values[row.acronym].append(row.value)
                dates[row.acronym].append(row.date.strftime('%d-%m-%Y'))

        max_value = {}
        min_value = {}
        average = {}
        deviation = {}
        coverage = {}
        distribution = {}
        all_values = []
        data = []

        for acronym in acronyms:
            average[acronym] = numpy.mean(values[acronym])
            max_value[acronym] = max(values[acronym])
            min_value[acronym] = min(values[acronym])
            coverage[acronym] = len(dates[acronym])/(end_date - first_date).days
            deviation[acronym] = numpy.std(values[acronym], ddof=1)
            temp = numpy.histogram(values[acronym], bins=histogram_bins)
            distribution[acronym] = [temp[0].tolist(), temp[1].tolist()]

            data.append({"acronym": acronym, "cord_id": cord, "mean": average[acronym], "max_val": max_value[acronym],
                         "min_val": min_value[acronym], "std_deviation": deviation[acronym],
                         "coverage": coverage[acronym], "distribution": distribution[acronym]})

        """ THIS PART CALCULATES THE FULL HISTOGRAM OF ALL DATA
            all_values += values[acronym]
        temp = numpy.histogram(all_values)
        data.append({"full_distribution": [temp[0].tolist(), temp[1].tolist()]})
        """
        return data


def get_cluster_data(start_date, end_date, kpi, acronym, **options):
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
        cord_ids = set()

        for cluster_row in fetch_cluster_cords(acronym):
            cord_ids.add(cluster_row.cord_id)
            while start_date < end_date:
                result = PlmnProcessed.objects.filter(kpi_basename=kpi).filter(date=start_date).\
                                               filter(cord_id=cluster_row.cord_id).filter(acronym=acronym)
                start_date += step
                for row in result:
                    values[row.cord_id].append(row.value)
                    dates[row.cord_id].append(row.date.strftime('%d-%m-%Y'))

        max_value = {}
        min_value = {}
        average = {}
        deviation = {}
        coverage = {}
        distribution = {}
        all_values = []
        data = []

        for cord in cord_ids:
            average[cord] = numpy.mean(values[cord])
            max_value[cord] = max(values[cord])
            min_value[cord] = min(values[cord])
            coverage[cord] = len(dates[cord]) / (end_date - first_date).days
            deviation[cord] = numpy.std(values[cord], ddof=1)
            temp = numpy.histogram(values[cord], bins=histogram_bins)
            distribution[cord] = [temp[0].tolist(), temp[1].tolist()]

            data.append({"acronym": acronym, "cord_id": cord, "mean": average[cord], "max_val": max_value[cord],
                         "min_val": min_value[cord], "std_deviation": deviation[cord],
                         "coverage": coverage[cord], "distribution": distribution[cord]})

        """ THIS PART CALCULATES THE FULL HISTOGRAM OF ALL DATA
            all_values += values[acronym]
        temp = numpy.histogram(all_values)
        data.append({"full_distribution": [temp[0].tolist(), temp[1].tolist()]})
        """
        return data
