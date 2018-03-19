import datetime
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from toolbox.cassandra_object_mapper_models import KpiUnits
from backend.Flask.app.utils import parse_check_date
from backend.Flask.app.utils import fetch_cluster_cords


def get_operator_coverage(start_date, end_date, cord_ids, kpis):
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    first_date = start_date

    if not start_date and not end_date:
        return False
    else:
        connection.setup(['127.0.0.1'], 'pb2')
        step = datetime.timedelta(days=1)
        data = []
        x = 0

        for cord_id in cord_ids:
            for kpi in kpis:
                dates = set()
                data.append({"kpi_basename": kpi, "cord_id": cord_id, "coverage": []})
                while start_date < end_date:
                    result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date).\
                                                       filter(kpi_basename=kpi)
                    start_date += step
                    for row in result:
                        dates.add(row.date)
                data[x]["coverage"] = len(dates) / (end_date - first_date).days
                x += 1
                start_date = first_date

        return data


def get_cluster_coverage(start_date, end_date, acronyms, kpis):
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    first_date = start_date

    if not start_date and not end_date:
        return False
    else:
        connection.setup(['127.0.0.1'], 'pb2')
        step = datetime.timedelta(days=1)
        data = []
        x = 0

        for acronym in acronyms:
            for row in fetch_cluster_cords(acronym):
                for kpi in kpis:
                    data.append({"kpi_basename": kpi, "acronym": acronym, "cord_id": row.cord_id, "coverage": []})
                    while start_date < end_date:
                        result = PlmnProcessedCord.objects.filter(cord_id=row.cord_id).filter(date=start_date).\
                                                           filter(kpi_basename=kpi).filter(acronym=acronym)
                        start_date += step
                        for result_row in result:
                            data[x]["coverage"].append(result_row.date)
                    start_date = first_date
                    data[x]["coverage"] = len(data[x]["coverage"]) / (end_date - first_date).days
                    x += 1

        return data
