from backend.app import parse_check_date
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
import datetime
from matplotlib import pyplot
import numpy

cord_id = 117
acronym = 'breabuc'
kpi_basename = 'SGSN_2012'
start_date = '2017-01-01'
end_date = '2018-04-01'

start_date = parse_check_date(start_date)
end_date = parse_check_date(end_date)

first_date = start_date
last_date = end_date

connection.setup(['127.0.0.1'], 'pb2')
step = datetime.timedelta(days=1)

data = {'values': [], 'dates': []}
while start_date < end_date:
    result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date) \
        .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
    start_date += step
    for row in result:
        data['values'].append(row.value)
        data['dates'].append(row.date)

window_size = 20
fig = pyplot.figure()
data_right = []
data_left = []

for i in range(0, window_size):
    first_date -= step
    last_date += step
    result_left = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=first_date)\
        .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
    result_right = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=last_date)\
        .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
    for row in result_right:
        data_right.append(row.value)
    for row in result_left:
        data_left.append(row.value)

temp_data = data_left[::-1] + data['values'] + data_right
if len(data_left)+len(data_right) < window_size:
    temp_data.append([None]*window_size)

moving_mean = []
for i in range(0, len(data['values'])):
    moving_mean.append(numpy.median(temp_data[i:i+window_size]))

ax = fig.add_subplot(111)
ax.plot(data['dates'], data['values'], marker='o', linestyle='None', markersize=2)
ax.plot(data['dates'], moving_mean, color='r')

# for window_size in window_sizes:
#     moving_mean = []
#     ax = fig.add_subplot(len(window_sizes),1,x)
#     x += 1
#     for i in range(0, dataframe.shape[0] - window_size):
#         moving_mean_temp = dataframe.iloc[i : i+window_size, -1]
#         moving_mean.append(numpy.median(moving_mean_temp))
#
#     moving_mean_dataframe = pandas.DataFrame({'values': moving_mean, 'dates': frame_setup['dates'][:-window_size]})
#     moving_mean_dataframe = moving_mean_dataframe.set_index(['dates'])
#
#     ax.plot(dataframe, marker='o', linestyle="None", markersize=2)
#     ax.plot(moving_mean_dataframe, color='r')
#     ax.set_title("Window size: %s" % window_size)

pyplot.show()