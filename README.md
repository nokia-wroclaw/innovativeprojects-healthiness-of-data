[![Build Status](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data.svg?branch=devel)](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data)

# innovativeprojects-healthiness-of-data

Demo: http://healthiness-of-data.ovh

## Table of contents
1. Project goal
2. Functionalities
3. Technologies
4. Installation guide
5. People


# 1. Project goal
Project goal was to donec in sem vel augue egestas scelerisque ut non tellus. Donec vel turpis libero. Sed at feugiat leo. Pellentesque faucibus diam in lorem dignissim, nec consectetur est luctus. Curabitur diam urna, sollicitudin id aliquam sit amet, porttitor a eros. Proin nec justo tempor, condimentum ligula at, gravida tellus. Integer lacinia justo turpis, vel mollis enim fermentum non. Etiam vitae diam ut purus fermentum semper at non elit. Etiam non semper eros. 


# 2. Functionalities
Application can do some cool stuff
* Aggregates and histogram
* Coverage
* Decomposition
* Outliers
* 2D map

# 3. Technologies
* Backend
  * Python 3
  * Flasgger
* Frontend
  * Angular 2+ https://angular.io/
  * Angular Material https://material.angular.io/
  * Charts.js https://www.chartjs.org/
* Cassandra
* Docker


# 4. Installation guide
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

# 5. People
Students
* Wojciech Adamek (lead backend & data science)
* Jacek Zalewski (lead frontend)
* Jakub Walecki
* Dominika Maślanka

Nokia's superiors
* Mateusz Sikora
* Ewa Kaczmarek

