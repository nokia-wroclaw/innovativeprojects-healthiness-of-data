from cassandra.cluster import Cluster
import csv

cassandraCluster = Cluster()

session = cassandraCluster.connect('pb2')

query = session.execute('SELECT * FROM plmn_raw LIMIT 1000000') # Gets all data from database

kpiDictionary = {}
kpiDataFile = 'kpi_collection_ready.csv'

# This creates a dictionary for easy look-ups on units.
# Key is the KPI name and it's value is array consisting of 3 values in this exact order: unit name, minimum value, maximum value
with open(kpiDataFile, 'r') as row:
    kpiReader = csv.reader(row)
    next(kpiReader)
    for readerRow in kpiReader:
        kpiDictionary[readerRow[0]] = readerRow[1:4]

#print(kpiDictionary)

# Function checks if the value is in correct range of the unit
# @params a row of data from query (Can possibly be changed to raw kpi name and it's value)
# @returns True or False depending if the value is correct
faultyKeys = [] # This is for testing purposes to store the keys that are not in dictionary.
def isValueInRange(queryRow):
    try:
        minValue = kpiDictionary[queryRow[4]][1] # Take the second value (minimum) from dictionary with 4th key which is kpi_name in the table
        maxValue = kpiDictionary[queryRow[4]][2] # Same as above except third value which is minimum
        if not compare(minValue, maxValue, queryRow[6]):
            print('The value is not in range')
            print(queryRow)
    except TypeError:
        print('Type error')
        print(queryRow)
        print(minValue)
        print(maxValue)
    except KeyError:
        if queryRow[4] not in faultyKeys:   # Check for keys not found in the kpi file
            faultyKeys.append(queryRow[4])  # Append keys that are not found
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
    isValueInRange(row)

print(faultyKeys)