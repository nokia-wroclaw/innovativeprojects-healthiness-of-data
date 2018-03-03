import csv

# This function merges together kpi ready document with unit ranges from unit_range document.

kpiFile = 'kpi_without_dupes_unified.csv'
unitRangeFile = 'unit_range.csv'

outputFile = open('kpi_collection_ready.csv', 'w', newline='')

writer = csv.writer(outputFile)
writer.writerow(['KPI', 'Unit', 'Min', 'Max'])

with open(kpiFile, 'r') as kpiRow:
    kpiReader = csv.reader(kpiRow)
    for kpiReaderRow in kpiReader:
        with open(unitRangeFile, 'r') as unitRow:
            unitReader = csv.reader(unitRow)
            for unitReaderRow in unitReader:
                if kpiReaderRow[1] == unitReaderRow[0]: # Look up the unit from kpi file in the unit_range file.
                    writerRow = [kpiReaderRow[0], unitReaderRow[0], unitReaderRow[1], unitReaderRow[2]]
                    writer.writerow(writerRow)