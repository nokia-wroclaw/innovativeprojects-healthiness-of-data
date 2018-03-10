"""
Routing file required by flask
"""
from app import app
from flask import request
from flask import abort
from .calculate_data import get_cord_data
import json


@app.route('/')
@app.route('/index')
def index():
    """Built in function"""
    return "Hello World!"


# EXAMPLE OF THE URL FORMAT: /api/operators/117?date_start=2016-01-01&date_end=2018-04-01&kpi_basename=SGSN_2012
@app.route('/api/operators/<int:cord_id>', methods=['GET'])
def get_name(cord_id):
    options = {}
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')

    data = get_cord_data(date_start, date_end, kpi_basename, cord=cord_id, acronym=False)
    if not data:
        return json.dumps({"Success": False})
    else:
        return json.dumps(data)
