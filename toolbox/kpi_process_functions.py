"""Processor for kpi"""
import csv
import os
from cassandra.cluster import Cluster

dir_path = os.path.dirname(os.path.realpath(__file__))
kpi_input_raw_file = 'kpi_units.csv'
kpi_input_units_file = 'unit_range.csv'
kpi_out_unique_names_file = 'kpi_out_no_name_duplicates.csv'
kpi_check_duplicate_names_file = 'kpi_check_single_duplicate.csv'
kpi_check_both_duplicates_file = 'kpi_check_both_duplicates.csv'
kpi_out_unified_units_file = 'kpi_out_unified_units.csv'
kpi_check_units_variety_file = 'kpi_check_units_variety.csv'
kpi_out_merged = 'kpi_out_merged_final.csv'


def kpi_check_name_duplicates():
    """Produces two csv files with duplicated names and with uniqe ones"""
    duplicates = []
    try:
        output_file = open(kpi_out_unique_names_file, 'w', newline='')
        duplicates_output_file = open(kpi_check_duplicate_names_file, 'w', newline='')
        new_writer = csv.writer(output_file)
        duplicates_writer = csv.writer(duplicates_output_file)

        with open(kpi_input_raw_file, 'r') as kpi_row:
            kpi_reader = csv.reader(kpi_row)
            for kpi_reader_row in kpi_reader:
                # If duplicate not found, add it to file and array.
                if kpi_reader_row[0] not in duplicates:
                    duplicates.append(kpi_reader_row[0])
                    new_writer.writerow(kpi_reader_row)
                else:
                    # If duplicate found, add it to removed file.
                    duplicates_writer.writerow(kpi_reader_row)
        output_file.close()
        duplicates_output_file.close()
    except FileNotFoundError:
        print("File not found.")


def kpi_check_unit_discrepancies():
    """Check all entries with the same name and different units"""
    try:
        output_file = open(kpi_check_both_duplicates_file, 'w', newline='')
        both_duplicates_writer = csv.writer(output_file)
        with open(kpi_out_unique_names_file, 'r') as kpiRow:
            kpi_reader = csv.reader(kpiRow)
            for kpi_reader_row in kpi_reader:
                with open(kpi_check_duplicate_names_file, 'r') as duplicateRow:
                    duplicate_reader = csv.reader(duplicateRow)
                    # Find duplicate row in removed file and original file
                    for duplicateReaderRow in duplicate_reader:
                        if kpi_reader_row[0] == duplicateReaderRow[0]:
                            both_duplicates_writer.writerow(kpi_reader_row) # Add both to file
                            both_duplicates_writer.writerow(duplicateReaderRow)
    except FileNotFoundError:
        print("File not found.")


def kpi_units_unify():
    """This function generates unified unit dict"""
    units_dict = {
        "%": "%",
        "min/GB": "min/GB",
        "#": "#",
        "kB": "kB",
        "kbps/TSL": "kb/s/E",
        "E": "E",
        "kbps": "kb/s",
        "# / min": "#/min",
        "TSL(or erlang)": "E",
        "GB": "GB",
        "s": "s",
        "min": "min",
        "pps": "p/s",
        "hrs": "h",
        "Mbyte": "MB",
        "kbit/s": "kb/s",
        "cell/s": "cell/s",
        "dBm": "dBm",
        "erlangs": "E",
        "Mbit": "Mb",
        "MB": "MB",
        "Mbps": "Mb/s",
        "#/s": "#/s",
        "B": "B",
        "#/bearer/h": "#/bearer/h",
        "packets": "p",
        "KB": "kB",
        "#/sub/h": "#/sub/h",
        "Bps": "B/s",
        "bps": "b/s",
        "kBps": "kB/s",
        "MBps": "MB/s",
        "ms": "ms",
        "dB": "dB",
        "Kbyte": "kB",
        "Mbit/s": "Mb/s",
        "MB/s": "MB/s",
        "#/h": "#/h",
        "km": "km",
        "us": "us",
        "kWh": "kWh",
        "byte": "B",
        "Kbit/s": "kb/s",
        "Bit/s/Hz": "b/s/Hz",
        "1/GB": "1/GB",
        "1/GByte": "1/GB",
        "": "#",
        "Percentage": "%",
        "#/min": "#/min",
        "Bytes": "B",
        "packet": "p",
        "mE": "mE",
        "Byte": "B",
        "degree Celsius": "degree Celsius",
        "Pkt/s": "p/s",
        "MByte": "MB",
        "cps": "cell/s",
        "kbit": "kb",
        "RXLEV": "RXLEV",
        "Sec": "s",
        "W": "W",
        "Kbps": "kb/s",
        "kpbs": "kb/s",
        "Seconds": "s",
        "Packets": "p",
        "Microseconds": "us",
        "ppb": "ppb",
        "Integer number": "#",
        "Mbit / Dropped RAB": "Mb/Dropped RAB",
        "kilobit": "kb",
        "Events/s": "Events/s",
        "Ehr": "Ehr",
        "kBHCA": "kBHCA",
        "Minutes/drop": "min/drop",
        "-100.0*dBm": "-100.0*dBm",
        " #": "#",
        "Erl": "E",
    }
    try:
        output_file = open(kpi_out_unified_units_file, 'w', newline='')
        writer = csv.writer(output_file)
        with open(kpi_out_unique_names_file, 'r') as row:
            reader = csv.reader(row)
            for reader_row in reader:
                # Index 1 is unit
                if reader_row[1] in units_dict:
                    reader_row[1] = units_dict[reader_row[1]]
                    writer.writerow(reader_row)

        output_file.close()
    except FileNotFoundError:
        print("File %s not found." % output_file)


def kpi_check_units_variety():
    """Double check unit unification"""
    try:
        duplicate_units = []
        output_file = open(kpi_check_units_variety_file, 'w', newline='')
        with open(kpi_out_unified_units_file, 'r') as row:
            reader = csv.reader(row)
            # Read data row.
            for readerRow in reader:
                # Check if this unit has already been discovered.
                if readerRow[1] in duplicate_units:
                    continue
                else:
                    # If not, append file and list
                    output_file.write(readerRow[1]+'\n')
                    duplicate_units.append(readerRow[1])

        output_file.close()
    except FileNotFoundError:
        print("File %s not found." % kpi_check_units_variety_file)


def kpi_name_units_merge():
    """Prepare units with ranges"""
    try:
        merged_file_output = open(kpi_out_merged, 'w', newline='')
        merged_writer = csv.writer(merged_file_output)
        merged_writer.writerow(['KPI', 'Unit', 'Min', 'Max'])
        with open(kpi_out_unified_units_file, 'r') as kpi_row:
            kpi_reader = csv.reader(kpi_row)
            for kpi_reader_row in kpi_reader:
                with open(kpi_input_units_file, 'r') as unit_row:
                    unit_reader = csv.reader(unit_row)
                    for unit_reader_row in unit_reader:
                        # Look up the unit from kpi file in the unit_range file.
                        if kpi_reader_row[1] == unit_reader_row[0]:
                            write_row = [
                                kpi_reader_row[0],
                                unit_reader_row[0],
                                unit_reader_row[1],
                                unit_reader_row[2]]
                            merged_writer.writerow(write_row)
    except FileNotFoundError:
        print("File %s not found" % kpi_out_merged)


def kpi_get_collection_dictionary():
    """Prepares dict with kpi name as key and unit and bounds as value"""
    kpi_dictionary = {}
    kpi_data_file = dir_path+'/kpi_out_merged_final.csv'
    with open(kpi_data_file, 'r') as row:
        kpi_reader = csv.reader(row)
        next(kpi_reader)
        for readerRow in kpi_reader:
            kpi_dictionary[readerRow[0]] = readerRow[1:4]
    return kpi_dictionary


def kpi_insert_into_database():
    """Put kpi dict into db
       TODO: change session execute to batch statement for performance
    """
    cassandra_cluster = Cluster()
    session = cassandra_cluster.connect('pb2')
    insert_unit = session.prepare(
        'INSERT INTO kpi_units (kpi_name, unit, min, max) VALUES (?, ?, ?, ?)')
    kpi_dict = kpi_get_collection_dictionary()
    for key in kpi_dict:
        min_val = kpi_dict[key][1]
        max_val = kpi_dict[key][2]
        # Check for nulls.
        if not min_val:
            min_val = None
        else:
            min_val = float(min_val)
        if not max_val:
            max_val = None
        else:
            max_val = float(max_val)
        session.execute(insert_unit, (key.lower(), kpi_dict[key][0], min_val, max_val,))


# Functions to fully process the raw files.
kpi_check_name_duplicates()
kpi_check_unit_discrepancies()
kpi_units_unify()
kpi_check_units_variety()
kpi_name_units_merge()
kpi_insert_into_database()
