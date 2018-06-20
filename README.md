[![Build Status](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data.svg?branch=devel)](https://travis-ci.org/nokia-wroclaw/innovativeprojects-healthiness-of-data)

# innovativeprojects-healthiness-of-data

## Table of contents
1. Project overview
2. Functionality
3. Technologies
4. Installation
5. Contributing


# 1. Project overview
The goal of this project is to process and visualize existing operator data provided by Nokia. This consists of multiple steps: cleaning up raw data, organizing kpi information, creating an API to provide data to front-end and finally creating a web application for users to view it. This project should ease future decisions and planning regarding analysed operator's services.

Project can be seen over at http://healthiness-of-data.ovh

API can be accessed by everyone over at http://healthiness-of-data.ovh/api

And finally API documentation over at http://healthiness-of-data.ovh/apidocs


# 2. Functionality
When you enter the site you can access the functionality in Components dropdown menu.

Currently we have finished and visualized these data endpoints:

* Aggregates and histogram - Calculates aggregates - minimum value, maximum value, mean, standard deviation, coverage and distribution of data. Distribution is displayed by a bar graph - similiar to a histogram, except it's not fully discrete. The amount of bars are calculated by providing an additional argument - histogram bins. This signalizes, that the data should be split into x bins of equal ranges between minimum and maximum value. This data can be displayed for all or a single cluster depending on whether or not it's provided.

* Coverage - Creates a table for all specified acronyms and their KPIs. On intersections you can read the coverage of data provided by an acronym and it's KPI. 

* Decomposition - Decomposes data and creates seasonal and trend chart. **This works only on cluster level (acronym has to be provided along with it's corresponding cord id).** Additionally, you can choose the frequency at which the data should be decomposed.

* Outliers - Detects outliers in the queried data set and creates a chart visualizing them. **This works only on cluster level (acronym has to be provided along with it's corresponding cord id).** Additionally, you can choose the threshold to specify the cutoff for outliers. The lower it is, the more outliers will be detected.

* 2D map - This component generates a map which indicates the relational performance of operators. It allows to clearly see which operators behave similarly - provide similiar quality of services. It can also generate a heatmap that shows how the similiarities change over time.

# 3. Technologies
* Backend
  * Python 3
  * Flask
  * Flasgger (Swagger)
* Frontend
  * Angular 6 https://angular.io/
  * Angular Material https://material.angular.io/
  * Charts.js https://www.chartjs.org/
* Cassandra


# 4. Installation guide
**The project is available to everyone at http://healthiness-of-data.ovh/homepage**

**If you want to set it up locally:**
**Before setting up the project edit the config.yml file in main directory and input local database and API addresses and ports.**
**Install Cassandra, enter CQL Shell and setup a keyspace:**

    CREATE KEYSPACE IF NOT EXISTS pb2  
      WITH REPLICATION = {'class':'SimpleStrategy', 'replication_factor':5};  


**Then run the toolbox/create_cassandra_tables.py script to create all necessary database tables.**

**Import the data into corresponding tables which are: plmn_raw, plmn_raw_cord.**

**Then you either need to process the data by running the script at proccssing/process_data.py (This process takes a long time) or load it from dumped files into plmn_processed and plmn_processed_cord**

**Lastly you need to run toolbox/kpi_process_functions.py and toolbox/insert_cluster_list.py**

**IMPORTANT!!**

**Increase batch limit size to 50000 kb in cassandra.yaml config file.**

**After setting up Cassandra, you can start the API by running start_backend.py script.**
**To run the front-end first you need to have NodeJS installed. Then enter the /frontend/ directory in command prompt and install Angular globally by:**
```
npm install -g @angular/cli
```
**Then you need to install all node modules required by the app by running:**
```
npm i
```
**And finally if everything went right you can run the front-end by:**
```
ng serve
```
**You can access it by default at localhost:4200**


# 5. Contributing
Students
* Wojciech Adamek
* Jacek Zalewski
* Jakub Walecki
* Dominika Maślanka

Nokia Supervisors
* Mateusz Sikora
* Ewa Kaczmarek
* Marcin Koralewski

