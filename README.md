[![Build Status](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data.svg?branch=devel)](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data)

# innovativeprojects-healthiness-of-data

To properly run the script first you need the following tables in cassandra:

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

and

CREATE TABLE IF NOT EXISTS kpi_units (
  kpi_name TEXT,
  unit TEXT,
  min DOUBLE,
  max DOUBLE,
  PRIMARY KEY (kpi_name)
) WITH COMPACTION={'class':'DateTieredCompactionStrategy'};

Then you need to export the data from the original table with the following command:
COPY plmn_raw (date, kpi_basename, cord_id, acronym, kpi_name, kpi_version, value) TO 'file.csv'
and then
COPY plmn_raw_date FROM 'file.csv'

When the tables are ready, run the kpi_process_functions.py script from toolbox.