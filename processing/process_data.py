from cassandra.cluster import Cluster
from difflib import get_close_matches
import datetime
from cassandra_utils import cassandra_get_unit_data


kpi_dictionary = cassandra_get_unit_data()
print(kpi_dictionary)

# Function checks if the value is in correct range of the unit
# @params a row of data from query (Can possibly be changed to raw kpi name and it's value)
# @returns True or False depending if the value is correct
faulty_keys = []    # This is for testing purposes to store the keys that are not in dictionary.


def is_value_in_range(query_row):
    # Take the range values from the dictionary with 4th key which is kpi_name in the table
    min_value, max_value = get_values_from_dictionary(query_row[4], kpi_dictionary)

    # If returned values are false - kpi not found in the standard dictionary, try to find a close match.
    if query_row[4] in faulty_keys:
        return False
    else:
        if min_value is False and max_value is False:     # Name not found in the dictionary
            #print(min_value, max_value, query_row[4])
            # Get 3 closest words with cutoff 0.9 (very similiar)
            # The function is slow so to not call it every time, we store the data in a new dictionary.
            # This can be changed to append the existing dictionary.
            close_words = get_close_matches(query_row[4], kpi_dictionary, 3, 0.8)
            if len(close_words) != 0:   # Similiar results found.
                for close_word in close_words:  # Iterate through found similarities.
                    if close_word in kpi_dictionary:    # If one of them is in dictionary, add them.
                        kpi_dictionary[query_row[4]] = [kpi_dictionary[close_word][0],
                                                        kpi_dictionary[close_word][1],
                                                        kpi_dictionary[close_word][2],
                                                        close_words[0]]
                        min_value, max_value = get_values_from_dictionary(query_row[4], kpi_dictionary)
                        break
            else:
                if query_row[4] not in faulty_keys:
                    faulty_keys.append(query_row[4])

        return compare(min_value, max_value, query_row[6])


# This function could be further optimized
# @params minimum value, maximum value and the real value
# @returns True if real value is between min and max value, else False
def compare(min_val, max_val, real_val):
    if not min_val and not max_val:
        return True
    elif not max_val:
        if real_val >= min_val:
            return True
        else:
            return False
    elif not min_val:
        if real_val <= max_val:
            return True
        else:
            return False
    else:
        return False


# Looks up the unit range in the given dictionary. Either the standard kpi or the new closest one.
# @params kpi_name and dictionary in which to look up
# @returns minimum and maximum value of unit range
def get_values_from_dictionary(name, diction):
    if name in diction:
        return diction[name][1], diction[name][0]
    elif name.upper() in diction:   # Check for both upper and lower letter cases.
        return diction[name.upper()][1], diction[name.upper()][0]
    elif name.lower() in diction:
        return diction[name.lower()][1], diction[name.lower()][0]
    else:
        return False, False


cassandra_cluster = Cluster()
session = cassandra_cluster.connect('pb2')
query = session.prepare('SELECT * FROM plmn_raw_date WHERE date=?') # This will be replaced with an object mapper in the future.
new_date = datetime.datetime(2018, 2, 1) # select all entries from a day.
print(new_date)
query_result = session.execute(query, (new_date,)) # Gets all data from database

# IF THE VALUE IS FAULTY PRINT IT.
for row in query_result:
    if not is_value_in_range(row) and row[4] not in faulty_keys:
        print(row)
        print(row[4])
        print(get_values_from_dictionary(row[4], kpi_dictionary))
        #print(faulty_keys)

print(faulty_keys)
print(kpi_dictionary)
"""
CREATE TABLE IF NOT EXISTS plmn_raw_date (
  kpi_name TEXT,
  kpi_basename TEXT,
  kpi_version TEXT,
  cord_id BIGINT,
  acronym TEXT,
  date TIMESTAMP,
  value DOUBLE,
  PRIMARY KEY (date, kpi_basename, cord_id, acronym, kpi_name)
) WITH CLUSTERING ORDER BY (kpi_basename DESC) AND 
COMPACTION={'class':'DateTieredCompactionStrategy', 'timestamp_resolution':'DAYS'};
  
CREATE TABLE IF NOT EXISTS kpi_units (
  kpi_name TEXT,
  unit TEXT,
  min DOUBLE,
  max DOUBLE,
  PRIMARY KEY (kpi_name)
) WITH COMPACTION={'class':'DateTieredCompactionStrategy'};

"""