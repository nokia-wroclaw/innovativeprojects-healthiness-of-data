import datetime

import pandas
import statsmodels.api
import yaml
from cassandra.cqlengine import connection

from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from .utils import parse_check_date


def calculate_cluster_decomposition(start_date, end_date, kpi_basename, cord_id, acronym, frequency):
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)

    # frequency = options.get('frequency')
    if not frequency:
        frequency = 31
    else:
        frequency = int(frequency)

    if not start_date and not end_date:
        return {"error": "Incorrect dates."}, 400

    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])
    step = datetime.timedelta(days=1)
    kpi_basename = kpi_basename.upper()
    frame_setup = {'values': [], 'dates': []}
    while start_date < end_date:
        result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date) \
            .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
        start_date += step
        for row in result:
            frame_setup['values'].append(row.value)
            frame_setup['dates'].append(row.date)

    if frequency >= len(frame_setup['values']):
        return {"error": "Frequency can't be higher than amount of found data."}, 400

    data_frame = pandas.DataFrame(frame_setup)
    data_frame = data_frame.set_index(['dates'])

    decomp = statsmodels.api.tsa.seasonal_decompose(data_frame, freq=frequency, model='multiplicative')

    cut_nan = int(frequency / 2)

    data = {"cord_id": cord_id,
            "acronym": acronym,
            "kpi_basename": kpi_basename,
            "start_date": start_date,
            "end_date": end_date,
            "seasonal_values": decomp.seasonal['values'].tolist(),
            "seasonal_dates": decomp.seasonal.index.tolist(),
            "trend_values": decomp.trend['values'].tolist()[cut_nan:-cut_nan],
            "trend_dates": decomp.trend.index.tolist()[cut_nan:-cut_nan],
            "observed_values": decomp.observed['values'].tolist(),
            "observed_dates": decomp.observed.index.tolist()
            }
    return data, 200
