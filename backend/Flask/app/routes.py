"""
Routing file required by flask
"""
from flasgger import Swagger

from ..app import app
from flask import request
from flask import jsonify
from .api_aggregate_functions import get_cord_data
from .api_aggregate_functions import get_cluster_data
from .api_coverage_functions import get_operator_coverage
from .api_coverage_functions import get_cluster_coverage
from .api_outlier_function import get_operator_outlier
from .api_outlier_function import get_cluster_outlier
from .api_periodicity_functions import get_operator_periodicity


@app.route('/')
@app.route('/index')
def index():
    """Built in function"""
    return "Hello World!"


"""AGGREGATE CALCULATING ENDPOINTS"""


@app.route('/api/operators/aggregates/<int:cord_id>', methods=['GET'])
def get_operator_aggregates(cord_id):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    histogram_bins = request.args.get('bins')  # DEFAULT 10

    data = get_cord_data(date_start, date_end, kpi_basename, cord_id, hist_bins=histogram_bins)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


@app.route('/api/clusters/aggregates/<string:acronym>', methods=['GET'])
def get_cluster_aggregates(acronym):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    histogram_bins = request.args.get('bins')

    data = get_cluster_data(date_start, date_end, kpi_basename, acronym, hist_bins=histogram_bins)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


"""COVERAGE CALCULATING ENDPOINTS"""


@app.route('/api/operators/coverage/', methods=['GET'])
def get_operator_coverages():
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpis = request.args.getlist('kpi_basename')
    cord_ids = request.args.getlist('cord_id')

    data = get_operator_coverage(date_start, date_end, cord_ids, kpis)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


# http://localhost:5000/api/clusters/coverage/?date_start=2016-01-01&date_end=2018-12-01&kpi_basename=LTE_5644&acronym=serzhus
@app.route('/api/clusters/coverage/', methods=['GET'])
def get_cluster_coverages():
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpis = request.args.getlist('kpi_basename')
    acronyms = request.args.getlist('acronym')

    data = get_cluster_coverage(date_start, date_end, acronyms, kpis)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


@app.route('/api/operators/outliers/<int:cord_id>', methods=['GET'])
def get_operator_outliers(cord_id):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    threshold = request.args.get('threshold')

    data = get_operator_outlier(date_start, date_end, kpi_basename, cord_id, threshold)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


# ZMIENIĆ - DOBRAĆ JEDEN CORD
# http://localhost:5000/api/clusters/outliers/urdett?date_start=2016-01-01&date_end=2016-01-01&kpi_basename=LTE_5644&threshold=5
@app.route('/api/clusters/outliers/<string:acronym>', methods=['GET'])
def get_cluster_outliers(acronym):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    threshold = request.args.get('threshold')

    data = get_cluster_outlier(date_start, date_end, kpi_basename, acronym, threshold)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


@app.route('/api/operators/periodicity/<int:cord_id>', methods=['GET'])
def get_operator_periodicities(cord_id):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')

    data = get_operator_periodicity(date_start, date_end, kpi_basename, cord_id)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)
