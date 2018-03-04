from cassandra.cluster import Cluster
from toolbox.kpiFileReader import kpi_get_collection_dictionary
import datetime
import sys
sys.path.append('../')


# Check if the URL name is in the KPI dictionary
def check_name(name):
    dictionary = kpi_get_collection_dictionary()
    if name.lower() not in dictionary and name.upper() not in dictionary:
        print('Wrong name')
        return False
    else:
        return True


# Parse the date given in URL in format dd-mm-yyyy
def parse_date(entry):
    year, month, date = map(int, entry.split('-'))
    return year, month, date


# Check if the date given is real
def check_date(year, month, day):
    try:
        new_date = datetime.datetime(year, month, day)
        return new_date
    except ValueError:
        print('Bad date')
        return False
    except:
        print('Bad date')
        return False


def get_data_from_cassandra(startdatestring, enddatestring, name):
    if not check_name(name):
        return False
    else:
        start_year, start_month, start_day = parse_date(startdatestring)
        end_year, end_month, end_day = parse_date(enddatestring)
        start_date = check_date(start_year, start_month, start_day)
        end_date = check_date(end_year, end_month, end_day)
        if not start_date or not end_date:
            return False
        else:
            try:
                cassandra_cluster = Cluster()
                session = cassandra_cluster.connect('pb2')

                # THIS IS A WORKAROUND. NAME QUERY DOESN'T HAVE A KPI VERSION, JUST THE BASENAME.
                # CALLING JUST SGSN_2012 WOULD RESULT IN FAILURE
                # SO UNTIL WE COME UP WITH AN IDEA FOR THAT, WE WILL CALL FOR SGSN_2012A AND REMOVE LAST CHARACTER
                name = name[:-1]
                get_data = session.prepare('SELECT * FROM plmn_raw WHERE kpi_basename=? AND date > ? AND date < ?')
                data = session.execute(get_data, (name, start_date, end_date,))
                print('Success')
                return data
            except: # IMPROVE THIS
                print('Exception')
                return False

#data = get_data_from_cassandra('2018-01-01', '2018-02-01', 'SGSN_2012a')




