from cassandra.cluster import Cluster
import sys
sys.path.append(sys.path[0] + "/../../")
from processing.cassandra_utils import cassandra_get_unit_data
import datetime


# Modify this if you want more data passed to the template.
desired_keys = ['kpi_basename', 'acronym', 'value', 'date']

# Check if the URL name is in the KPI dictionary
def check_name(name):
    dictionary = cassandra_get_unit_data()
    if name.lower() not in dictionary and name.upper() not in dictionary:
        print('Wrong name')
        return False
    else:
        return True


# Parse the date given in URL in format yyyy-mm-dd
def parse_date(entry):
    year, month, date = map(int, entry.split('-'))
    return year, month, date


# Check if the date given is correct
def check_date(year, month, day):
    try:
        new_date = datetime.datetime(year, month, day)
        return new_date
    except ValueError:
        print('Bad date')
        return False
    except:
        print('Unknown exception')
        return False


def get_data_from_cassandra(start_date_string, end_date_string, name):
    if not check_name(name):
        return False
    else:
        start_year, start_month, start_day = parse_date(start_date_string)
        end_year, end_month, end_day = parse_date(end_date_string)
        start_date = check_date(start_year, start_month, start_day)
        end_date = check_date(end_year, end_month, end_day)
        if not start_date or not end_date:
            return False
        else:
            # try:
            cassandra_cluster = Cluster()
            session = cassandra_cluster.connect('pb2')

            data_list = []

            # THIS IS A WORKAROUND. NAME QUERY DOESN'T HAVE A KPI VERSION, JUST THE BASENAME.
            # CALLING JUST SGSN_2012 WOULD RESULT IN FAILURE
            # SO UNTIL WE COME UP WITH AN IDEA FOR THAT, WE WILL CALL FOR SGSN_2012A AND REMOVE LAST CHARACTER
            name = name[:-1]
            get_data = session.prepare('SELECT * FROM plmn_raw WHERE kpi_basename=? AND date > ? AND date < ?')
            data = session.execute(get_data, (name, start_date, end_date,))
            copy = data
            for row in copy:
                # print(row)
                tmp = {}
                # print(dir(row))
                # print(row._fields)
                for attribute in row._fields:

                    if attribute in desired_keys:
                        tmp[attribute] = row.__getattribute__(attribute)
                data_list.append(tmp)
            print('Success')
            coverage = 0
            for row in data_list:
                coverage += row['value']
            coverage = coverage / len(data_list)
            return data_list, coverage