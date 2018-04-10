import datetime
import pandas
import statsmodels.api
from .utils import parse_check_date
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord


def calculate_cluster_decomposition(start_date, end_date, kpi_basename, cord_id, acronym, **options):
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)

    if not start_date and not end_date:
        return False
    else:

        with open("config.yml", 'r') as yml_file:
            config = yaml.load(yml_file)['database_options']

        connection.setup([config['address']], config['keyspace'])
        step = datetime.timedelta(days=1)

        frame_setup = {'values': [], 'dates': []}
        while start_date < end_date:
            result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date) \
                .filter(kpi_basename=kpi_basename).filter(acronym=acronym)
            start_date += step
            for row in result:
                frame_setup['values'].append(row.value)
                frame_setup['dates'].append(row.date)

        data_frame = pandas.DataFrame(frame_setup)
        data_frame = dataframe.set_index(['dates'])

        frequency = options.get('frequency')
        if not frequency:
            frequency = 31
        else:
            frequency = int(frequency)

        decomp = statsmodels.api.tsa.seasonal_decompose(data_frame, freq=frequency, model='additive')

        data = {"cord_id": cord_id,
                "acronym": acronym,
                "kpi_basename": kpi_basename,
                "start_date": start_date,
                "end_date": end_date,
                "seasonal_values": decomp.seasonal['values'].tolist(),
                "seasonal_dates": decomp.seasonal.index.tolist(),
                "trend_values": decomp.trend['values'].tolist(),
                "trend_dates": decomp.trend.index.tolist(),
                "observed_values": decomp.observed['values'].tolist(),
                "observed_dates": decomp.observed.index.tolist()
                }
        return data