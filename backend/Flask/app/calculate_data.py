import datetime
import sys
import numpy
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessed
sys.path.append(sys.path[0] + "/../../")


def parse_check_date(entry):
    """
    Parses and checks the entered date.
    :param entry: String with date
    :return: False if date not correct, else returns date
    """
    year, month, day = map(int, entry.split('-'))
    try:
        new_date = datetime.datetime(year, month, day)
        return new_date
    except ValueError:
        print('Bad date')
        return False
    except:
        print('Unknown exception')
        return False


def get_cord_data(start_date, end_date, kpi, **options):
    """
    Calculates all aggregates.
    :param start_date: beginning date of range
    :param end_date: ending date of range
    :param kpi: kpi_basename
    :param options: either cord or acr - depending on which one is provided different aggregates are calculated
    :return: False if no data is found, else returns data and calculated aggregates
    """
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    first_date = start_date
    if not start_date and not end_date:
        return False    # Dates incorrect.
    else:
        cord = options.get('cord')
        acr = options.get('acronym')
        connection.setup(['127.0.0.1'], 'pb2')
        step = datetime.timedelta(days=1)
        acronyms = []
        values = {}
        dates = {}

        while start_date < end_date:
            if cord:
                result = PlmnProcessed.objects.filter(kpi_basename=kpi).filter(date=start_date).filter(cord_id=cord)
            else:
                return False
            start_date += step
            for row in result:
                if row.acronym not in acronyms:
                    acronyms.append(row.acronym)
                if row.acronym in values:
                    values[row.acronym].append(row.value)
                    dates[row.acronym].append(row.date.strftime('%d-%m-%Y'))
                else:
                    values[row.acronym] = [row.value]
                    dates[row.acronym] = [row.date.strftime('%d-%m-%Y')]
        max_value = {}
        min_value = {}
        average = {}
        deviation = {}
        coverage = {}
        distribution = {}
        all_values = []
        data = []

        for acronym in acronyms:
            all_values += values[acronym]
            average[acronym] = numpy.mean(values[acronym])
            max_value[acronym] = max(values[acronym])
            min_value[acronym] = min(values[acronym])
            coverage[acronym] = len(dates[acronym])/(end_date - first_date).days
            deviation[acronym] = numpy.std(values[acronym], ddof=1)
            temp = numpy.histogram(values[acronym])
            distribution[acronym] = [temp[0].tolist(), temp[1].tolist()]
            data.append({"acronym": acronym, "mean": average[acronym], "max_val": max_value[acronym], "min_val": min_value[acronym],
                             "std_deviation": deviation[acronym], "coverage": coverage[acronym],
                             "distribution": distribution[acronym]})
                             #"values": values[acronym], "dates": dates[acronym]}
        temp = numpy.histogram(all_values)
        #data.append({"full_distribution": [temp[0].tolist(), temp[1].tolist()]})
        return data
