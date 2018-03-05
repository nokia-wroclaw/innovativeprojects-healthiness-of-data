import csv
import os

# This creates a dictionary for easy look-ups on units.
# Key is the KPI name and it's value is array consisting of 3 values in this exact order: unit name, minimum value, maximum value
dir_path = os.path.dirname(os.path.realpath(__file__))


def kpi_get_collection_dictionary():
    kpi_dictionary = {}
    kpi_data_file = dir_path+'/kpi_out_merged_final.csv'
    with open(kpi_data_file, 'r') as row:
        kpi_reader = csv.reader(row)
        next(kpi_reader)
        for readerRow in kpi_reader:
            kpi_dictionary[readerRow[0]] = readerRow[1:4]
    return kpi_dictionary
