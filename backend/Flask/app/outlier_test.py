from backend.Flask.app.utils import parse_check_date
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
import datetime
from matplotlib import pyplot
import numpy
import pandas

cord_id = 117
acronym = 'breabuc'
kpi_basename = 'SGSN_2012'
start_date = '2017-01-01'
end_date = '2018-06-01'

first_date = start_date

start_date = parse_check_date(start_date)
end_date = parse_check_date(end_date)

connection.setup(['127.0.0.1'], 'pb2')
step = datetime.timedelta(days=1)

frame_setup = {'values': [], 'dates': []}
while start_date < end_date:
    result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date) \
        .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
    start_date += step
    for row in result:
        frame_setup['values'].append(row.value)
        frame_setup['dates'].append(row.date)

dataframe = pandas.DataFrame(frame_setup)
dataframe = dataframe.set_index(['dates'])


window_sizes = [5, 10, 15]
fig = pyplot.figure()
x = 1

for window_size in window_sizes:
    moving_mean = []
    ax = fig.add_subplot(len(window_sizes),1,x)
    x += 1
    for i in range(0, dataframe.shape[0] - window_size):
        moving_mean_temp = dataframe.iloc[i : i+window_size, -1]
        moving_mean.append(numpy.median(moving_mean_temp))

    moving_mean_dataframe = pandas.DataFrame({'values': moving_mean, 'dates': frame_setup['dates'][:-window_size]})
    moving_mean_dataframe = moving_mean_dataframe.set_index(['dates'])

    ax.plot(dataframe, marker='o', linestyle="None", markersize=2)
    ax.plot(moving_mean_dataframe, color='r')
    ax.set_title("Window size: %s" % window_size)

pyplot.show()