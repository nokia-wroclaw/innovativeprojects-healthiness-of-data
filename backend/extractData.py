from cassandra.cluster import Cluster
import sys               # These 2 lines allow us for better organization.
sys.path.append('../')   # I moved function definition to another file since it needs to be also used elsewhere.
from toolbox.kpiFileReader import kpi_get_collection_dictionary

cassandra_cluster = Cluster()
session = cassandra_cluster.connect('pb2')
query = session.execute('SELECT * FROM plmn_raw LIMIT 10000') # Gets all data from database

kpi_dictionary = kpi_get_collection_dictionary()

# Function checks if the value is in correct range of the unit
# @params a row of data from query (Can possibly be changed to raw kpi name and it's value)
# @returns True or False depending if the value is correct
faulty_keys = [] # This is for testing purposes to store the keys that are not in dictionary.


def is_value_in_range(query_row):
    try:
        min_value = kpi_dictionary[query_row[4]][1] # Take the second value (minimum) from dictionary with 4th key which is kpi_name in the table
        max_value = kpi_dictionary[query_row[4]][2] # Same as above except third value which is minimum
        if not compare(min_value, max_value, query_row[6]):
            print('The value is not in range')
            print(query_row)
    except TypeError:
        print('Type error')
        print(query_row)
        print(min_value)
        print(max_value)
    except KeyError:
        if query_row[4] not in faulty_keys:   # Check for keys not found in the kpi file
            faulty_keys.append(query_row[4])  # Append keys that are not found
        #print('Key error')
        #print(queryRow[4])

# THIS NEEDS A LOT OF WORK!!
# A function that takes
# @params minimum value, maximum value and the real value
# @returns True if real value is between min and max value, else False
# THIS FUNCTION IS GARBAGE. CHANGE IT!!


def compare(minVal, maxVal, realVal):
    if minVal == maxVal:
        return True
    elif minVal == '':
        if realVal > maxVal:
            return False
        else:
            return True
    elif maxVal == '':
        if realVal < minVal:
            return False
        else:
            return True
    elif realVal < minVal or realVal > maxVal:
        return False
    else:
        return True


for row in query:
    is_value_in_range(row)

print(faulty_keys)