import csv

kpi_input_raw_file = 'kpi_units.csv'
kpi_input_units_file = 'unit_range.csv'
kpi_out_unique_names_file = 'kpi_out_no_name_duplicates.csv'
kpi_check_duplicate_names_file = 'kpi_check_single_duplicate.csv'
kpi_check_both_duplicates_file = 'kpi_check_both_duplicates.csv'
kpi_out_unified_units_file = 'kpi_out_unified_units.csv'
kpi_check_units_variety_file = 'kpi_check_units_variety.csv'
kpi_out_merged = 'kpi_out_merged_final.csv'


# This function checks for duplicates in the first column of input csv file kpi_input_raw
# Writes a file without duplicates, and another one only with found duplicates.
def kpi_check_name_duplicates():
    duplicates = []
    try:
        output_file = open(kpi_out_unique_names_file, 'w', newline='')
        duplicates_output_file = open(kpi_check_duplicate_names_file, 'w', newline='')
        new_writer = csv.writer(output_file)
        duplicates_writer = csv.writer(duplicates_output_file)

        with open(kpi_input_raw_file, 'r') as kpi_row:
            kpi_reader = csv.reader(kpi_row)
            for kpi_reader_row in kpi_reader:
                if kpi_reader_row[0] not in duplicates: # If duplicate not found, add it to file and array.
                    duplicates.append(kpi_reader_row[0])
                    new_writer.writerow(kpi_reader_row)
                else:
                    duplicates_writer.writerow(kpi_reader_row) # If duplicate found, add it to removed file.
        output_file.close()
        duplicates_output_file.close()
    except FileNotFoundError:
        print("File not found.")


# THIS IS JUST UTILITY CODE. CREATE FILE WITH BOTH DUPLICATES TO CHECK FOR UNIT DISCREPANCIES.
# Writes a file that has both rows which were identified as duplicates.
# This allows us to check if two rows with the same name had different units.
def kpi_check_unit_discrepancies():
    try:
        output_file = open(kpi_check_both_duplicates_file, 'w', newline='')
        both_duplicates_writer = csv.writer(output_file)
        with open(kpi_out_unique_names_file, 'r') as kpiRow:
            kpi_reader = csv.reader(kpiRow)
            for kpi_reader_row in kpi_reader:
                with open(kpi_check_duplicate_names_file, 'r') as duplicateRow:
                    duplicate_reader = csv.reader(duplicateRow)
                    for duplicateReaderRow in duplicate_reader: # Find duplicate row in removed file and original file
                        if kpi_reader_row[0] == duplicateReaderRow[0]:
                            both_duplicates_writer.writerow(kpi_reader_row) # Add both to file
                            both_duplicates_writer.writerow(duplicateReaderRow)
    except FileNotFoundError:
        print("File not found.")


# UNITS UNIFICATION SCRIPT
# Checks for different units in the input kpi file and substitutes them according to the dictionary below.
def kpi_units_unify():
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
                if reader_row[1] in units_dict: # Index 1 is unit
                    reader_row[1] = units_dict[reader_row[1]]
                    writer.writerow(reader_row)

        output_file.close()
    except FileNotFoundError:
        print("File %s not found." % output_file)


# THIS SCRIPT IS PURELY UTILITY
# It creates a file with all unique units found in the input file. Checks if unit unification was done properly.
def kpi_check_units_variety():
    try:
        duplicate_units = []
        output_file = open(kpi_check_units_variety_file, 'w', newline='')
        with open(kpi_out_unified_units_file, 'r') as row:
            reader = csv.reader(row)
            for readerRow in reader: # Read data row.
                if readerRow[1] in duplicate_units: # Check if this unit has already been discovered.
                    continue
                else:
                    output_file.write(readerRow[1]+'\n') # If not, append file and list
                    duplicate_units.append(readerRow[1])

        output_file.close()
    except FileNotFoundError:
        print("File %s not found." % kpi_check_units_variety_file)


# This function merges together kpi ready document with unit ranges from unit_range document.
def kpi_name_units_merge():
    try:
        merged_file_output = open(kpi_out_merged, 'w', newline='')
        merged_writer = csv.writer(merged_file_output)
        merged_writer.writerow(['KPI','Unit','Min','Max'])
        with open(kpi_out_unified_units_file, 'r') as kpi_row:
            kpi_reader = csv.reader(kpi_row)
            for kpi_reader_row in kpi_reader:
                with open(kpi_input_units_file, 'r') as unit_row:
                    unit_reader = csv.reader(unit_row)
                    for unit_reader_row in unit_reader:
                        if kpi_reader_row[1] == unit_reader_row[0]: # Look up the unit from kpi file in the unit_range file.
                            write_row = [kpi_reader_row[0], unit_reader_row[0], unit_reader_row[1], unit_reader_row[2]]
                            merged_writer.writerow(write_row)
    except FileNotFoundError:
        print("File %s not found" % kpi_out_merged)


"""Uncomment this and run this script to create ready files.

kpi_check_name_duplicates()
kpi_check_unit_discrepancies()
kpi_units_unify()
kpi_check_units_variety()
kpi_name_units_merge()
"""