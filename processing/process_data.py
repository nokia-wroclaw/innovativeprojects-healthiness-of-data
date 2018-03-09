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
from toolbox.cord_ids import get_cord_id_list
sys.path.append(sys.path[0] + "/../../")

cord_id_list = get_cord_id_list()
print(cord_id_list)

kpi_dictionary = cassandra_get_unit_data()
print(kpi_dictionary)
faulty_keys = {}    # This is for testing purposes to store the keys that are not in dictionary.

letter_list = list(string.ascii_lowercase)
letter_list = letter_list[1:len(letter_list)]
print(letter_list)


def is_value_in_range(query_row):
    """
    function checks if value falls between logical bounds
    :param query_row: row of db to be checked
    :return: bool value whether it is ok or not
    """
    # Take the range values from the dictionary with 4th key which is kpi_name in the table
    kpi_temp = query_row.kpi_name.lower()

    min_value, max_value = get_values_from_dictionary(kpi_temp, kpi_dictionary)

    if kpi_temp in faulty_keys:
        return False
    else:
        if min_value is False and max_value is False:     # Name not found in the dictionary
            if not find_best_kpi_match(kpi_temp, kpi_dictionary):
                MissingKpis.create(kpi_basename=query_row.kpi_basename, kpi_name=kpi_temp)
                faulty_keys[kpi_temp] = True
                return False
            else:
                min_value, max_value = get_values_from_dictionary(kpi_temp, kpi_dictionary)
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
        return real_val > min_val
    elif not min_val and max_val:
        return real_val < max_val


def get_values_from_dictionary(name, diction):
    """
    dictionary reader
    :param name: kpi_name we are looking for
    :param diction: reference to dictionary in which to search for
    :return: false if not found in dictionary, else min and max values
    """
    if name in diction:
        return diction[name][1], diction[name][0]
    else:
        return False, False


def find_best_kpi_match(name, diction):
    """
    kpi closest version finder
    :param name: kpi_name we want to find closest match
    :param diction: dictionary which to append if value is found
    :return: false if no close match found else the latest version of the param provided
    """
    find_version = KpiUnits.objects(kpi_name=name+'a')
    if not find_version:
        return False
    else:
        for letter in letter_list:
            new_version = KpiUnits.objects(kpi_name=name+letter)
            if not new_version:
                for row_version in find_version:
                    diction[row_version.kpi_name][0] = row_version.max
                    diction[row_version.kpi_name][1] = row_version.min
                    diction[row_version.kpi_name][2] = row_version.unit
                    return True
            else:
                find_version = new_version


connection.setup(['127.0.0.1'], "pb2")
step = datetime.timedelta(days=3)

limit_date = datetime.datetime(2002, 1, 1)
min_date = datetime.datetime(2018, 3, 28)
max_date = datetime.datetime(2018, 3, 31)
#rows_processed = 0

reading_time = 0
writing_time = 0
processing_time = 0

total_time = time.time()
while min_date > limit_date:
    good_queries = BatchQuery()

    read_time_start = time.time()
    res = PlmnRawCord.objects.filter(cord_id=20).filter(date__gt=min_date).filter(date__lte=max_date)
    read_time_end = time.time()
    reading_time += read_time_end - read_time_start

    #rows_processed += len(res)
    #print("Rows processed %s " % rows_processed)
    print(min_date)

    write_time_start = time.time()
    for row in res:
        processing_time_start = time.time()
        check_val = is_value_in_range(row)
        processing_time_end = time.time()
        processing_time += processing_time_end - processing_time_start

        if check_val:
            PlmnProcessed.batch(good_queries).create(kpi_basename=row.kpi_basename, date=row.date, cord_id=row.cord_id,
                                                     acronym=row.acronym, kpi_name=row.kpi_name,
                                                     kpi_version=row.kpi_version, value=row.value)

    good_queries.execute()
    write_time_end = time.time()
    writing_time += write_time_end - write_time_start# 100 h

    min_date -= step
    max_date -= step

end_time = time.time()
print("Total time: %s" % (end_time - total_time))
print("Fetching data time: %s" % reading_time)
print("Writing data time (includes processing): %s" % writing_time)
print("Processing data time: %s" % processing_time)
print("Date step: %s" % step)


"""
while min_date > limit_date:
    #start_month = time.time()
    good_queries = BatchQuery()
    bad_queries = BatchQuery()
    res_filtered = res.filter(date__in=[min_date, max_date])
    for row in res:
        if not is_value_in_range(row) and row.kpi_name.lower() not in faulty_keys:
            #print(row, row.value)
            PlmnBadEntries.batch(bad_queries).create(kpi_basename=row.kpi_basename, date=row.date, cord_id=row.cord_id,
                                 acronym=row.acronym, kpi_name=row.kpi_name, kpi_version=row.kpi_version, value=row.value)
        else:
            PlmnProcessed.batch(good_queries).create(kpi_basename=row.kpi_basename, date=row.date, cord_id=row.cord_id,
                                 acronym=row.acronym, kpi_name=row.kpi_name, kpi_version=row.kpi_version, value=row.value)
    min_date -= step
    max_date -= step
    good_queries.execute()
    bad_queries.execute()
    #end_month = time.time()
    #print("%s processed in %s" % (min_date, (end_month-start_month)))

    end = time.time()
    #print("%s processed in %s" % (20, (end-start)))
    print("Processed total of %s rows in %s s" % (rows_processed, (end-total_time)))
"""
"""
# NO BATCHES
limit_date = datetime.datetime(2002, 1, 1)
rows_processed = 0
reading_time = 0
comparing_time = 0
writing_time = 0
total_time = time.time()
cord = 20
start = time.time()
min_date = datetime.datetime(2018, 3, 1)
max_date = datetime.datetime(2018, 4, 1)
read_time_start = time.time()
res = PlmnRawCord.objects(cord_id=cord)
read_time_end = time.time()
reading_time += read_time_end-read_time_start


rows_processed+=len(res)
for row in res:

    check_time_start = time.time()
    boolch = is_value_in_range(row)
    check_time_end = time.time()
    comparing_time += check_time_end-check_time_start

    write_time_start = time.time()
    if not boolch and row.kpi_name.lower() not in faulty_keys:
        PlmnBadEntries.create(kpi_basename=row.kpi_basename, date=row.date, cord_id=row.cord_id,
                             acronym=row.acronym, kpi_name=row.kpi_name, kpi_version=row.kpi_version, value=row.value)
    else:
        PlmnProcessed.create(kpi_basename=row.kpi_basename, date=row.date, cord_id=row.cord_id,
                             acronym=row.acronym, kpi_name=row.kpi_name, kpi_version=row.kpi_version, value=row.value)
    write_time_end = time.time()
    writing_time+=write_time_end-write_time_start

end = time.time()
print("%s processed in %s" % (cord, (end-start)))
print("Processed total of %s rows in %s s" % (rows_processed, (end-total_time)))
print("Reading time: %s" % reading_time)
print("Comparing time: %s" % comparing_time)
print("Writing time: %s" % writing_time)"""