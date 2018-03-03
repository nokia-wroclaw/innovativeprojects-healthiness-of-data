import csv

# Set file names.
kpiFile = 'kpi_units.csv'
kpiFileOutput = 'kpi_units_without_duplicates.csv' # This is file ready to go through next processing.
kpiDuplicatesOutput = 'kpi_units_removed_names.csv' # File which outputs only items that were removed from original file.
kpiDuplicateNamesOutput = 'kpi_units_duplicates.csv' # File which holds both removed and original items - all the duplicates.

duplicates = []

outputFile1 = open(kpiFileOutput, 'w', newline='')
outputFile2 = open(kpiDuplicatesOutput, 'w', newline='')
# Create writers for new csv files
newKpiWriter = csv.writer(outputFile1)
duplicatesWriter = csv.writer(outputFile2)

# CHECK FOR NAMES ONLY
# Read the file row by row
with open(kpiFile, 'r') as kpiRow:
    kpiReader = csv.reader(kpiRow)
    for kpiReaderRow in kpiReader:
        if kpiReaderRow[0] not in duplicates: # If duplicate not found, add it to file and array.
            duplicates.append(kpiReaderRow[0])
            newKpiWriter.writerow(kpiReaderRow)
        else:
            duplicatesWriter.writerow(kpiReaderRow) # If duplicate found, add it to removed file.

outputFile1.close()
outputFile2.close()
outputFile3 = open(kpiDuplicateNamesOutput, 'w', newline='')
nameDuplicatesWriter = csv.writer(outputFile3)

# THIS IS JUST UTILITY CODE. CREATE FILE WITH BOTH DUPLICATES TO CHECK FOR UNIT DISCREPANCIES
with open(kpiFileOutput, 'r') as kpiRow:
    kpiReader = csv.reader(kpiRow)
    for kpiReaderRow in kpiReader:
        with open(kpiDuplicatesOutput, 'r') as duplicateRow:
            duplicateReader = csv.reader(duplicateRow)
            for duplicateReaderRow in duplicateReader: # Find duplicate row in removed file and original file
                if kpiReaderRow[0] == duplicateReaderRow[0]:
                    nameDuplicatesWriter.writerow(kpiReaderRow) # Add both to file
                    nameDuplicatesWriter.writerow(duplicateReaderRow)


