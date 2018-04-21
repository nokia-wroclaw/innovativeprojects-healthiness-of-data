import numpy
import datetime
import yaml
from cassandra.cqlengine import connection
from .utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from toolbox.cord_ids import get_cord_id_list
sys.path.append(sys.path[0] + "/../../")

cord_id_list = get_cord_id_list()

start_date =
end_date =

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

        moving_standard_deviation.append(numpy.std(ready_data['values'][i - window_size: i + window_size]))

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
