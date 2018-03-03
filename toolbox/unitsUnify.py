import csv
# UNITS UNIFICATION SCRIPT
# Checks for different units in the datasheet and substitutes them according to the dictionary below.

# UNITS DICTIONARY

unitsDict = {
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
  "us": "µs",
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
  "°C": "°C",
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
  "Microseconds": "µs",
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


kpiFile = 'kpi_units_without_duplicates.csv' # File with all the data

outputFile = open('kpi_without_dupes_unified.csv', 'w', newline='')
writer = csv.writer(outputFile)
with open(kpiFile, 'r') as row:
    reader = csv.reader(row)
    for readerRow in reader:
        if readerRow[1] in unitsDict: # Index 1 is unit
            readerRow[1] = unitsDict[readerRow[1]]
            writer.writerow(readerRow)

outputFile.close()