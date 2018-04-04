import datetime
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from .utils import parse_check_date


def calculate_coverage(start_date, end_date, cord_id, acronyms, kpis):
    """
    Calculates data coverage.
    :param start_date: Starting date.
    :param end_date: Ending date.
    :param cord_id: Operator name.
    :param acronyms: Single or multiple acronyms belonging to given operator.
    :param kpis: Single or multiple kpi_basenames.
    :return: List of coverages for all combination of kpis and acronyms. False if dates are not correct.
    """
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)
    first_date = start_date

    if not start_date and not end_date:
        return False
    else:
        connection.setup(['145.239.87.179'], 'pb2')
        step = datetime.timedelta(days=1)
        data = []

        for acronym in acronyms:
            for kpi in kpis:
                dates = set()

                while start_date < end_date:
                    result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date).\
                                                       filter(kpi_basename=kpi).filter(acronym=acronym)
                    start_date += step
                    for row in result:
                        dates.add(row.date)

                data.append({
                            "kpi_basename": kpi,
                             "cord_id": cord_id,
                             "acronym": acronym,
                             "coverage": len(dates)*1.0 / (end_date - first_date).days
                             })

                start_date = first_date

        return data

