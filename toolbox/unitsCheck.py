import csv

# THIS SCRIPT IS PURELY UTILITY
# IT WAS USED TO LIST ALL THE DIFFERENT UNITS FOUND IN A CSV FILE

outputFile2 = open('units_variety_check2.csv', 'w', newline='')
inputFile = 'kpi_without_dupes_unified.csv' # File with data that has no duplicates

duplicates2 = []

# Reads the file using csv reader which returns every row as array. This allows to only check units.
with open(inputFile, 'r') as row:
    reader = csv.reader(row)
    for readerRow in reader: # Read data row.
        if readerRow[1] in duplicates2: # Check if this unit has already been discovered.
            continue
        else:
            outputFile2.write(readerRow[1]+'\n') # If not, append file and list
            duplicates2.append(readerRow[1])

outputFile2.close()