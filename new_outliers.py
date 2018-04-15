import numpy
import datetime
from cassandra.cqlengine import connection
from backend.api_functions.utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from matplotlib import pyplot
import math

window_size = 80
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
        return False
    else:
        connection.setup(['145.239.87.179'], 'pb2')
        first_date = start_date
        last_date = end_date
        step = datetime.timedelta(days=1)

        ready_data = {"cord_id": cord_id, "acronym": acronym, "kpi_basename": kpi_basename, "values": [],
                      "outliers": [], "outlier_values": [], "dates": [], "outlier_dates": []}

        while start_date < end_date:
            result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date) \
                .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
            start_date += step
            for row in result:
                ready_data["values"].append(row.value)
                ready_data["dates"].append(row.date)



        data_right = []
        data_left = []

        for i in range(0, window_size):
            first_date -= step
            last_date += step
            result_left = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=first_date) \
                .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
            result_right = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=last_date) \
                .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
            for row in result_right:
                data_right.append(row.value)
            for row in result_left:
                data_left.append(row.value)

        temp_data = data_left[::-1] + ready_data['values'] + data_right
        if len(data_left) + len(data_right) < window_size:
            temp_data += [temp_data[0]] * window_size

        moving_mean = []
        moving_standard_deviation = []
        for i in range(window_size, len(ready_data['values'])-window_size):
            temp_mean1 = numpy.median(ready_data['values'][i - window_size: i])
            temp_mean2 = numpy.median(ready_data['values'][i - window_size//2: i + window_size//2])
            temp_mean3 = numpy.median(ready_data['values'][i: i + window_size])
            temp_mean_array = [temp_mean1, temp_mean2, temp_mean3]

            closest_mean_index = (numpy.abs(numpy.array(temp_mean_array)-ready_data['values'][i])).argmin()
            moving_mean.append(temp_mean_array[closest_mean_index])

            moving_standard_deviation.append(numpy.std(ready_data['values'][i - window_size: i + window_size]))

        # new_array = []
        # for i in range(0, window_size):
        #     new_array.append(numpy.mean(ready_data['values'][i: i + window_size]))
        #     moving_standard_deviation.append(numpy.std(ready_data['values'][i: i + window_size]))
        #
        # for i in range(len(ready_data['values'])-window_size, len(ready_data['values'])):
        #     moving_mean.append(numpy.mean(ready_data['values'][i-window_size: i]))
            #moving_standard_deviation.append(numpy.std(ready_data['values'][i: i - window_size]))

        #moving_mean = new_array + moving_mean


        if not threshold:
            threshold = 3.5

        median = numpy.median(ready_data["values"])
        mad_values = []
        modified_z_scores = []
        x = 0

        # for val in ready_data["values"]:
        #     mad_values.append(numpy.abs(val - median))
        # median_absolute_deviation = numpy.median(mad_values)
        # for val in ready_data["values"]:
        #     modified_z_scores.append(0.6745 * (val - moving_mean[x]) / median_absolute_deviation)
        #     x += 1
        for i in range(window_size, len(ready_data['values']) - window_size):
            z_score = (ready_data['values'][i] - moving_mean[x]) / moving_standard_deviation[x]
            modified_z_scores.append(z_score)
            x+=1



        ready_data["outliers"] = numpy.where(numpy.abs(modified_z_scores) > threshold)[0].tolist()
        ready_data['outliers'] = [elem + window_size for elem in ready_data['outliers']]

        variance_changes = {'values': [], 'dates': []}
        # for i in range(0, len(ready_data["values"]) - 41):
        #     var1 = numpy.var(ready_data["values"][i:i + 20], ddof=1)
        #     var2 = numpy.var(ready_data["values"][i + 18:i + 38], ddof=1)
        #     factor = (math.log(max(var1,var2))**2) / (math.log(min(var1,var2))**2)
        #     variance_changes['values'].append(factor*10+100)
        #     variance_changes['dates'].append(ready_data['dates'][i])

        for outlier in ready_data["outliers"]:
            ready_data["outlier_values"].append(ready_data["values"][outlier])
            ready_data["outlier_dates"].append(ready_data["dates"][outlier])

        print(len(ready_data['values']))
        print(len(moving_mean))
        return ready_data, moving_mean, variance_changes


ready_data, moving_mean, data_changes = find_outliers('2015-01-03', '2018-04-01', 'SGSN_2012', 'Skuntank', 'dilfihess', 3.5)
# 2015-01-03 / 2016-01-03
fig = pyplot.figure()
ax = fig.add_subplot(211)
ax.plot(ready_data['dates'], ready_data['values'], marker='o', linestyle='None', markersize=2)
ax.plot(ready_data['dates'][window_size:-window_size], moving_mean, color='r')
ax.plot(ready_data["outlier_dates"], ready_data["outlier_values"], marker='x', linestyle='None', markersize=8)
#ax.plot(data_changes['dates'], data_changes['values'], marker='o', linestyle='--', color='g', markersize=1)

ready_data, moving_mean, data_changes = find_outliers('2016-01-03', '2018-04-01', 'SGSN_2012', 'Skuntank', 'dilfihess', 3.5)
ax2 = fig.add_subplot(212)
ax2.plot(ready_data['dates'], ready_data['values'], marker='o', linestyle='None', markersize=2)
ax2.plot(ready_data['dates'][window_size:-window_size], moving_mean, color='r')
ax2.plot(ready_data["outlier_dates"], ready_data["outlier_values"], marker='x', linestyle='None', markersize=8)
#ax2.plot(data_changes['dates'], data_changes['values'], marker='o', linestyle='--', color='g', markersize=1)

fig.suptitle('Window size: %s' % window_size)
pyplot.show()