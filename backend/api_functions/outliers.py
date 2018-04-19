import numpy
import datetime
import yaml
from cassandra.cqlengine import connection
from .utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord


def find_outliers(start_date, end_date, kpi_basename, cord_id, acronym, threshold):
    """
    Function for finding outliers.
    :param start_date: Starting date.
    :param end_date: Ending date.
    :param kpi_basename: One kpi basename.
    :param cord_id: Operator cord id.
    :param acronym: Cluster acronym that belongs to given operator cord id.
    :param threshold: Threshold for outlier cutoff. Default 3.5
    :return: List of all values and found outliers. False if given dates are incorrect.
    """
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)

    if not start_date and not end_date:
        return {error: "Incorrect dates."}
    else:
        with open("config.yml", 'r') as yml_file:
            config = yaml.load(yml_file)['database_options']

        connection.setup([config['address']], config['keyspace'])
        step = datetime.timedelta(days=1)
        kpi_basename = kpi_basename.lower()

        ready_data = {"cord_id": cord_id, "acronym": acronym, "kpi_basename": kpi_basename, "values": [],
                      "outliers": [], "outlier_values": [], "dates": []}

        while start_date < end_date:
            result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date) \
                .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
            start_date += step
            for row in result:
                ready_data["values"].append(row.value)
                ready_data["dates"].append(row.date)

    if not threshold:
        threshold = 3.5

    median = numpy.median(ready_data["values"])
    mad_values = []
    modified_z_scores = []
    for val in ready_data["values"]:
        mad_values.append(numpy.abs(val - median))
    median_absolute_deviation = numpy.median(mad_values)
    for val in ready_data["values"]:
        modified_z_scores.append(0.6745 * (val - median) / median_absolute_deviation)

    ready_data["outliers"] = numpy.where(numpy.abs(modified_z_scores) > float(threshold))[0].tolist()

    for outlier in ready_data["outliers"]:
        ready_data["outlier_values"].append(ready_data["values"][outlier])

    return ready_data
