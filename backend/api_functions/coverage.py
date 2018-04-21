import datetime
import yaml
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from .utils import parse_check_date


def calculate_cluster_coverage(start_date, end_date, cord_id, acronyms, kpis, gap_size):
    """
    Calculates data coverage.
    :param start_date: Starting date.
    :param end_date: Ending date.
    :param cord_id: Operator name.
    :param acronyms: Single or multiple acronyms belonging to given operator.
    :param kpis: Single or multiple kpi_basenames.
    :param gap_size: Minimum value to determine if gap is actually a gap.
    :return: List of coverages for all combination of kpis and acronyms. False if dates are not correct.
    """
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    first_date = start_date
    gap_size = int(gap_size) + 1

    if gap_size <= 0:
        return {"error": "Gap size is too small - min value: 1"}, 400

    if not start_date and not end_date:
        return {"error": "Incorrect dates."}, 400

    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['database_options']

    connection.setup([config['address']], config['keyspace'])
    step = datetime.timedelta(days=1)
    data = []

    for acronym in acronyms:
        for kpi in kpis:
            dates = list()
            kpi = kpi.upper()
            last_found_date = first_date
            values = list()
            gaps = list()
            gap = dict()
            while start_date < end_date:
                result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date). \
                    filter(kpi_basename=kpi).filter(acronym=acronym)
                start_date += step
                for row in result:
                    dates.append(row.date)
                    values.append(row.value)
                    if int((row.date - last_found_date).days) > gap_size:
                        gap = dict()
                        gap.update({
                            "gap_start": last_found_date,
                            "gap_end": row.date,
                            "gap_size": (row.date - last_found_date).days
                        })
                        gaps.append(gap)
                    last_found_date = row.date

            if not len(ready_data['values']):
                return {"error": "No data found for given parameters."}, 400
            if (end_date - last_found_date).days > gap_size:
                gap = dict()
                gap.update({
                    "gap_start": last_found_date,
                    "gap_end": end_date,
                    "gap_size": (end_date - last_found_date).days
                })
                gaps.append(gap)
            data.append({
                "kpi_basename": kpi,
                "cord_id": cord_id,
                "acronym": acronym,
                "coverage": len(dates) * 1.0 / (end_date - first_date).days,
                "values": values,
                "dates": dates,
                "gaps": gaps
            })
            start_date = first_date

    return data, 200
