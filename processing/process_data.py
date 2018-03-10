"""
This module is the beginning of data processing module
For now it can check if value is in range
"""
import datetime
from cassandra.cqlengine import connection
from cassandra_utils import cassandra_get_unit_data
from cassandra.cqlengine.query import BatchQuery
import sys
import string
import time
from toolbox.cassandra_object_mapper_models import PlmnRawCord
from toolbox.cassandra_object_mapper_models import PlmnBadEntries
from toolbox.cassandra_object_mapper_models import KpiUnits
from toolbox.cassandra_object_mapper_models import MissingKpis
from toolbox.cassandra_object_mapper_models import PlmnProcessed
from toolbox.cassandra_object_mapper_models import PlmnKeyNotFound
from toolbox.cord_ids import get_cord_id_list
sys.path.append(sys.path[0] + "/../../")

cord_id_list = get_cord_id_list()

kpi_dictionary = cassandra_get_unit_data()
faulty_keys = {}

letter_list = list(string.ascii_lowercase)
letter_list = letter_list[1:len(letter_list)]


def is_value_in_range(query_row):
    """
    function checks if value falls between logical bounds
    :param query_row: row of db to be checked
    :return: bool value whether it is ok or not
    """
    kpi_temp = query_row.kpi_name.lower()
    min_value, max_value = get_values_from_dictionary(kpi_temp)
    if kpi_temp in faulty_keys:
        return False
    else:
        if min_value is False and max_value is False:
            if not find_best_kpi_match(query_row.kpi_basename.lower()):
                MissingKpis.create(kpi_basename=query_row.kpi_basename.lower(), kpi_name=kpi_temp, kpi_version=query_row.kpi_version)
                faulty_keys[kpi_temp] = True
                return False
            else:
                min_value, max_value = get_values_from_dictionary(kpi_temp)
                return compare(min_value, max_value, query_row.value)
        return compare(min_value, max_value, query_row.value)


def compare(min_val, max_val, real_val):
    """
    TODO: improve this function, get rid of so many if else statements.
    bounds checker
    :param min_val:
    :param max_val:
    :param real_val:
    :return: True if real_val in range of min and max else False
    """
    if min_val and max_val:
        return (real_val - max_val) * (real_val - min_val) <= 0
    elif not min_val and not max_val:
        return True
    elif min_val and not max_val:
        return real_val >= min_val
    elif not min_val and max_val:
        return real_val <= max_val


def get_values_from_dictionary(name):
    """
    dictionary reader
    :param name: kpi_name we are looking for
    :return: false if not found in dictionary, else min and max values
    """
    if name in kpi_dictionary:
        return kpi_dictionary[name][2], kpi_dictionary[name][1]
    else:
        return False, False


def find_best_kpi_match(basename):
    """
    kpi closest version finder
    :param basename: kpi_basename we want to find closest match
    :return: false if no close match found else the latest version of the param provided
    """
    find_version = KpiUnits.objects(kpi_basename=basename)
    if len(find_version) == 0:
        return False
    else:
        ver = find_version[len(find_version)-1]
        KpiUnits.create(kpi_basename=ver.kpi_basename, kpi_name=ver.kpi_basename,
                        max=ver.max, min=ver.min, unit=ver.unit)
        kpi_dictionary[basename] = [ver.kpi_name, ver.max, ver.min, ver.unit]
        return True


connection.setup(['127.0.0.1'], "pb2")
step = datetime.timedelta(days=15)

limit_date = datetime.datetime(2002, 1, 1)
log_file = open('logs.log', 'w')
total_time = 0
for cord in cord_id_list:
    min_date = datetime.datetime(2018, 3, 16)
    max_date = datetime.datetime(2018, 3, 31)
    start_time = time.time()
    while min_date > limit_date:
        good_queries = BatchQuery()
        bad_queries = BatchQuery()
        keys_not_found_queries = BatchQuery()

        res = PlmnRawCord.objects.filter(cord_id=cord).filter(date__gt=min_date).filter(date__lte=max_date)

        for row in res:
            if is_value_in_range(row):
                PlmnProcessed.batch(good_queries).create(kpi_basename=row.kpi_basename,
                                                         date=row.date, cord_id=row.cord_id,
                                                         acronym=row.acronym, kpi_name=row.kpi_name,
                                                         kpi_version=row.kpi_version, value=row.value)
            elif row.kpi_name.lower() not in faulty_keys:
                PlmnBadEntries.batch(bad_queries).create(kpi_basename=row.kpi_basename,
                                                         date=row.date, cord_id=row.cord_id,
                                                         acronym=row.acronym, kpi_name=row.kpi_name,
                                                         kpi_version=row.kpi_version, value=row.value)
            else:
                PlmnKeyNotFound.batch(keys_not_found_queries).create(kpi_basename=row.kpi_basename,
                                                                     date=row.date, cord_id=row.cord_id,
                                                                     acronym=row.acronym, kpi_name=row.kpi_name,
                                                                     kpi_version=row.kpi_version, value=row.value)
        try:
            bad_queries.execute()
            keys_not_found_queries.execute()
            good_queries.execute()
        except Exception as e:
            log_file.write(str(e))
            pass

        min_date -= step
        max_date -= step

    end_time = time.time()
    total_time += (end_time - start_time)
    print("Cord_id %s processed in %s" % (cord, (end_time - start_time)))
    log_file.write("Cord %s processed \n" % cord)
    print("Total processing time %s" % total_time)

