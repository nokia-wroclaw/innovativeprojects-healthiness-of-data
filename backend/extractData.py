from cassandra.cluster import Cluster
import sys               # These 2 lines allow us for better organization.
from toolbox.kpiFileReader import kpi_get_collection_dictionary
from difflib import get_close_matches
sys.path.append('../')   # I moved function definition to another file since it needs to be also used elsewhere.


kpi_dictionary = kpi_get_collection_dictionary()
closest_words_dictionary = {}

# Function checks if the value is in correct range of the unit
# @params a row of data from query (Can possibly be changed to raw kpi name and it's value)
# @returns True or False depending if the value is correct
faulty_keys = []    # This is for testing purposes to store the keys that are not in dictionary.


def is_value_in_range(query_row):
    # Take the range values from the dictionary with 4th key which is kpi_name in the table
    min_value, max_value = get_values_from_dictionary(query_row[4], kpi_dictionary)

    # If returned values are false - kpi not found in the standard dictionary, try to find a close match.
    if not min_value and not max_value:     # Name not found in the dictionary
        min_value, max_value = get_values_from_dictionary(query_row[4], closest_words_dictionary)
        if not min_value and not max_value:
            # Get 3 closest words with cutoff 0.9 (very similiar)
            # The function is slow so to not call it every time, we store the data in a new dictionary.
            # This can be changed to append the existing dictionary.
            close_words = get_close_matches(query_row[4], kpi_dictionary, 3, 0.8)
            if len(close_words) != 0:   # Copies the values into new dictionary with other kpi names.
                kpi_dictionary[query_row[4]] = [kpi_dictionary[close_words[0]][0],
                                                kpi_dictionary[close_words[0]][1],
                                                kpi_dictionary[close_words[0]][2]]
                min_value, max_value = get_values_from_dictionary(query_row[4], kpi_dictionary)
            else:
                if query_row[4] not in faulty_keys:
                    faulty_keys.append(query_row[4])

    if not min_value and not max_value:
        return False
    else:
        return compare(min_value, max_value, query_row[6])


# This function could be further optimized
# @params minimum value, maximum value and the real value
# @returns True if real value is between min and max value, else False
def compare(min_val, max_val, real_val):
    if not min_val and not max_val:
        return True
    elif not max_val:
        min_val = float(min_val) # Need to convert it to float since all query data is string.
        if real_val >= min_val:
            return True
        else:
            return False
    elif not min_val:
        max_val = float(max_val)
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
        return diction[name][1], diction[name][2]
    elif name.upper() in diction:   # Check for both upper and lower letter cases.
        return diction[name.upper()][1], diction[name.upper()][2]
    elif name.lower() in diction:
        return diction[name.lower()][1], diction[name.lower()][2]
    else:
        return False, False


cassandra_cluster = Cluster()
session = cassandra_cluster.connect('pb2')
#query = session.prepare('SELECT * FROM plmn_raw WHERE kpi_basename=? LIMIT 100000')
#query_result = session.execute(query, ('SGSN_2012',)) # Gets all data from database
query_result = session.execute('SELECT * FROM plmn_raw LIMIT 10000')

# THIS WILL BE CHANGED TO EXTRACT DATA IN PARTS USING ORDER BY DATE.
for row in query_result:
    if not is_value_in_range(row) and row[4] not in faulty_keys:
        print(row)
        print(faulty_keys)

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
  
CREATE TABLE IF NOT EXISTS plmn_processed (
  kpi_name TEXT,
  kpi_basename TEXT,
  kpi_version TEXT,
  cord_id BIGINT,
  acronym TEXT,
  date TIMESTAMP,
  value DOUBLE,
 unit TEXT,
  PRIMARY KEY (kpi_basename, date, cord_id, acronym, kpi_name)
) WITH CLUSTERING ORDER BY (date DESC) AND
  COMPACTION={'class':'DateTieredCompactionStrategy', 'timestamp_resolution':'DAYS'};

"""