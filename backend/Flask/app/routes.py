from .cassandraCommunication import get_data_from_cassandra
from app import app
from flask import render_template


# Decorators for the function below. Whenever the / or /index address is invoked, the index() function will run.
@app.route('/')
@app.route('/index')
def index():
    return "Hello World!"


# EXAMPLE OF THE URL FORMAT: /SGSN_2012a/2018-01-01/2018-02-01
@app.route('/<string:name>/<string:start_date>/<string:end_date>/')
def get_name(start_date, end_date, name):
    get_data, coverage = get_data_from_cassandra(start_date, end_date, name)
    data_set = []

    # PLACEHOLDER FOR TESTS. THIS WILL BE CHANGED.
    for row in get_data:
        data_set.append(row)

    # THIS WILL HAVE TO BE CHANGED TO RENDER A TEMPLATE LIKE ONE BELOW. NOT FINISHED YET.
    return render_template('dataTable.html', data=data_set, cov=coverage)
    # TO ADD: ERROR HANDLING FOR EMPTY DATA.