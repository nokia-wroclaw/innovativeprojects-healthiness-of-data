import numpy
import datetime
import yaml
from cassandra.cqlengine import connection
from .utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord


def find_outliers(start_date, end_date, kpi_basename, cord_id, acronym, **options):
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
        return {"error": "Incorrect dates."}, 400

    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])
    step = datetime.timedelta(days=1)
    kpi_basename = kpi_basename.upper()

    ready_data = {"cord_id": cord_id,
                  "acronym": acronym,
                  "kpi_basename": kpi_basename,
                  "values": [],
                  "outliers": [],
                  "outlier_values": [],
                  "dates": []}

    while start_date < end_date:
        result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date) \
            .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
        start_date += step
        for row in result:
            ready_data["values"].append(row.value)
            ready_data["dates"].append(row.date)

    if not len(ready_data['values']):
        return {"error": "No data found for given parameters."}, 400

    threshold = options.get('threshold')
    if not threshold:
        threshold = 3.5
    else:
        threshold = float(threshold)

    window_size = options.get('window_size')
    if not window_size:
        window_size = 20
    else:
        window_size = int(window_size)

    if len(ready_data['values']) < 4 * window_size:
        median = numpy.median(ready_data["values"])
        mad_values = []
        modified_z_scores = []
        for val in ready_data["values"]:
            mad_values.append(numpy.abs(val - median))
        median_absolute_deviation = numpy.median(mad_values)
        for val in ready_data["values"]:
            modified_z_scores.append(0.6745 * (val - median) / median_absolute_deviation)

        ready_data["outliers"] = numpy.where(numpy.abs(modified_z_scores) > float(threshold))[0].tolist()
    else:
        window_size = 20
        moving_mean = []
        moving_standard_deviation = []
        for i in range(window_size, len(ready_data['values']) - window_size):

            temp_mean1 = numpy.median(ready_data['values'][i - window_size: i])
            temp_mean2 = numpy.median(ready_data['values'][i - window_size//2: i + window_size//2])
            temp_mean3 = numpy.median(ready_data['values'][i: i + window_size])
            temp_mean_array = [temp_mean1, temp_mean2, temp_mean3]

            closest_mean_index = (numpy.abs(numpy.array(temp_mean_array)-ready_data['values'][i])).argmin()
            moving_mean.append(temp_mean_array[closest_mean_index])

            temp_std1 = numpy.std(ready_data['values'][i - window_size: i])
            temp_std2 = numpy.std(ready_data['values'][i - window_size//2: i + window_size//2])
            temp_std3 = numpy.std(ready_data['values'][i: i + window_size])

            temp_std_array = [temp_std1, temp_std2, temp_std3]
            
            moving_standard_deviation.append(min(temp_std_array))

        modified_z_scores = []
        x = 0

        for i in range(window_size, len(ready_data['values']) - window_size):
            z_score = (ready_data['values'][i] - moving_mean[x]) / moving_standard_deviation[x]
            modified_z_scores.append(z_score)
            x += 1
            ready_data["outliers"] = numpy.where(numpy.abs(modified_z_scores) > threshold)[0].tolist()
            ready_data['outliers'] = [elem + window_size for elem in ready_data['outliers']]

    for outlier in ready_data["outliers"]:
        ready_data["outlier_values"].append(ready_data["values"][outlier])

    return ready_data, 200
