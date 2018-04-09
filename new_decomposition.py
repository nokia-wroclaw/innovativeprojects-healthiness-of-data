from backend.api_functions.utils import parse_check_date
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
import datetime
from matplotlib import pyplot
import pandas
import statsmodels.api

cord_id = 'Braviary'
acronym = 'breabuc'
kpi_basename = 'SGSN_2012'
start_date = '2017-01-01'
end_date = '2018-03-01'

first_date = start_date

start_date = parse_check_date(start_date)
end_date = parse_check_date(end_date)

connection.setup(['145.239.87.179'], 'pb2')
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

decomp = statsmodels.api.tsa.seasonal_decompose(dataframe, freq=31, model='additive')

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

# print(data)
decomp.plot()
pyplot.show()