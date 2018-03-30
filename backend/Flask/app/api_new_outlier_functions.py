import numpy
import datetime
from cassandra.cqlengine import connection
from backend.Flask.app.utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from matplotlib import pyplot


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
        connection.setup(['127.0.0.1'], 'pb2')
        first_date = start_date
        last_date = end_date
        step = datetime.timedelta(days=1)

        ready_data = {"cord_id": cord_id, "acronym": acronym, "kpi_basename": kpi_basename, "values": [],
                      "outliers": [], "outlier_values": [], "dates": [], "outlier_dates": []}

        while start_date < end_date:
            result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date)\
                                               .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
            start_date += step
            for row in result:
                ready_data["values"].append(row.value)
                ready_data["dates"].append(row.date)

        window_size = 30

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
        for i in range(0, len(ready_data['values'])):
            moving_mean.append(numpy.median(temp_data[i:i + window_size]))



        if not threshold:
            threshold = 3.5

        median = numpy.median(ready_data["values"])
        mad_values = []
        modified_z_scores = []
        x = 0
        for val in ready_data["values"]:
            mad_values.append(numpy.abs(val-median))
        median_absolute_deviation = numpy.median(mad_values)
        for val in ready_data["values"]:
            modified_z_scores.append(0.6745*(val - moving_mean[x])/median_absolute_deviation)
            x += 1

        ready_data["outliers"] = numpy.where(numpy.abs(modified_z_scores) > threshold)[0].tolist()

        for outlier in ready_data["outliers"]:
            ready_data["outlier_values"].append(ready_data["values"][outlier])
            ready_data["outlier_dates"].append(ready_data["dates"][outlier])

        return ready_data, moving_mean

ready_data, moving_mean = find_outliers('2015-01-03', '2018-04-01', 'SGSN_2012', 111, 'dilfihess', 3.5)
# 2015-01-03 / 2016-01-03
fig = pyplot.figure()
ax = fig.add_subplot(211)
ax.plot(ready_data['dates'], ready_data['values'], marker='o', linestyle='None', markersize=2)
ax.plot(ready_data['dates'], moving_mean, color='r')
ax.plot(ready_data["outlier_dates"], ready_data["outlier_values"], marker='x', linestyle='None', markersize=8)

ready_data, moving_mean = find_outliers('2016-01-03', '2018-04-01', 'SGSN_2012', 111, 'dilfihess', 3.5)
ax2 = fig.add_subplot(212)
ax2.plot(ready_data['dates'], ready_data['values'], marker='o', linestyle='None', markersize=2)
ax2.plot(ready_data['dates'], moving_mean, color='r')
ax2.plot(ready_data["outlier_dates"], ready_data["outlier_values"], marker='x', linestyle='None', markersize=8)

pyplot.show()