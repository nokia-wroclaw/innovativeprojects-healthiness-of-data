import numpy
import datetime
from cassandra.cqlengine import connection
from backend.Flask.app.utils import parse_check_date
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from backend.Flask.app.utils import fetch_cluster_cords


def get_operator_outlier(start_date, end_date, kpi_basename, cord_id, acronym, threshold):
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)

    if not start_date and not end_date:
        return False
    else:
        connection.setup(['127.0.0.1'], 'pb2')
        step = datetime.timedelta(days=1)

        ready_data = {"cord_id": cord_id, "acronym": acronym, "kpi_basename": kpi_basename, "values": [],
                      "outliers": [], "outlier_values": [], "dates": []}
        while start_date < end_date:
            result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date)\
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
        mad_values.append(numpy.abs(val-median))
    median_absolute_deviation = numpy.median(mad_values)
    for val in ready_data["values"]:
        modified_z_scores.append(0.6745*(val - median)/median_absolute_deviation)

    ready_data["outliers"] = numpy.where(numpy.abs(modified_z_scores) > threshold)[0].tolist()

    for outlier in ready_data["outliers"]:
        ready_data["outlier_values"].append(ready_data["values"][outlier])

    print(ready_data)
    return ready_data
#
#
# def get_cluster_outlier(start_date, end_date, kpi_basename, acronym, threshold):
#     start_date = parse_check_date(start_date)
#     end_date = parse_check_date(end_date)
#     if not start_date and not end_date:
#         return False
#     else:
#         first_date = start_date
#         connection.setup(['127.0.0.1'], 'pb2')
#         step = datetime.timedelta(days=1)
#         ready_data = []
#         cords = fetch_cluster_cords(acronym)
#         x = 0
#         for row in cords:
#             ready_data.append({"acronym": acronym, "cord_id": row.cord_id, "kpi_basename": kpi_basename, "values": [],
#                                "outliers": [], "outlier_values": []})
#             while start_date < end_date:
#                 result = PlmnProcessedCord.objects.filter(cord_id=row.cord_id).filter(date=start_date)\
#                                                    .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
#                 start_date += step
#                 for row in result:
#                     ready_data[x]["values"].append(row.value)
#             start_date = first_date
#             x += 1
#
#     if not threshold:
#         threshold = 3.5
#
#     for i in range(0, len(ready_data)):
#         median = numpy.median(ready_data[i]["values"])
#         mad_values = []
#         modified_z_scores = []
#         for val in ready_data[i]["values"]:
#             mad_values.append(numpy.abs(val-median))
#         median_absolute_deviation = numpy.median(mad_values)
#         for val in ready_data[i]["values"]:
#             modified_z_scores.append(0.6745*(val - median)/median_absolute_deviation)
#
#         ready_data[i]["outliers"] = numpy.where(numpy.abs(modified_z_scores) > float(threshold))[0].tolist()
#
#         for outlier in ready_data[i]["outliers"]:
#             ready_data[i]["outlier_values"].append(ready_data[i]["values"][outlier])
#
#     return ready_data
