[![Build Status](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data.svg?branch=devel)](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data)

# innovativeprojects-healthiness-of-data

**First setup a keyspace:**

    CREATE KEYSPACE IF NOT EXISTS pb2  
      WITH REPLICATION = {'class':'SimpleStrategy', 'replication_factor':5};  


**Then run the toolbox/create_cassandra_tables.py script to create all necessary database tables.
Import raw data into plmn_raw with this command:**

    copy plmn_raw from 'original_data_file.csv';

**Then you need to export the data from the original table with the following command:**

    COPY plmn_raw (cord_id, date, kpi_basename, acronym, kpi_name, kpi_version, value) TO 'file.csv'

**and load it into table with different primary keys.**

    COPY plmn_raw_cord FROM 'file.csv'

**Process the data by running processing/process_data.py script or load ready data into plmn_processed.
Then export and load the data into second table like before.**

    COPY plmn_processed (cord_id, date, kpi_basename, acronym, kpi_name, kpi_version, value) TO 'file.csv'

    COPY plmn_processed_cord FROM 'file.csv'

**IMPORTANT!!**

**Increase batch limit size to 50000 kb in cassandra.yaml config file.**
