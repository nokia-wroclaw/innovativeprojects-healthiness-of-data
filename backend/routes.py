from flasgger import Swagger, swag_from

# from ..app import app
from flask import Flask, request, jsonify
from flask_cors import CORS
from api_functions.utils import get_cord_id_list, get_cord_acronym_set, get_acronym_list, get_kpi_list
from api_functions.aggregates import get_cord_data, get_cluster_data
from api_functions.coverage import calculate_coverage
from api_functions.outliers import find_outliers
from api_functions.decomposition import get_operator_periodicity

"""AGGREGATE CALCULATING ENDPOINTS"""
app = Flask(__name__)
CORS(app)
Swagger(app)


@swag_from('api_docs/aggregates_operators.yml', validation=True)
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


@swag_from('api_docs/aggregates_clusters.yml', validation=True)
@app.route('/api/clusters/aggregates/<int:cord_id>/<string:acronym>', methods=['GET'])
def get_cluster_aggregates(cord_id, acronym):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    histogram_bins = request.args.get('bins')

    data = get_cluster_data(date_start, date_end, kpi_basename, cord_id, acronym, hist_bins=histogram_bins)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


"""COVERAGE CALCULATING ENDPOINTS"""


@swag_from('api_docs/coverage_clusters.yml', validation=True)
@app.route('/api/coverage/<int:cord_id>', methods=['GET'])
def get_operator_coverages(cord_id):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpis = request.args.getlist('kpi_basename')
    acronyms = request.args.getlist('acronym')
    print(date_start)
    print(date_end)
    print(cord_id)
    print(acronyms)
    print(kpis)

    data = calculate_coverage(date_start, date_end, cord_id, acronyms, kpis)
    if not data:
        return jsonify({"success": False})
    else:
        return jsonify(data)


@swag_from('api_docs/outliers_clusters.yml', validation=True)
@app.route('/api/outliers/<int:cord_id>/<string:acronym>', methods=['GET'])
def get_operator_outliers(cord_id, acronym):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    threshold = request.args.get('threshold')

    data = find_outliers(date_start, date_end, kpi_basename, cord_id, acronym, threshold)
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


@app.route('/api/fetch_kpi_basenames', methods=['GET'])
def get_kpi_basenames():
    return jsonify(get_kpi_list())


@app.route('/api/fetch_acronyms', methods=['GET'])
def get_acronyms():
    return jsonify(get_acronym_list())


@app.route('/api/fetch_cord_acronym_set', methods=['GET'])
def get_cord_acronyms_set():
    return jsonify(get_cord_acronym_set())


@app.route('/api/fetch_cord_ids', methods=['GET'])
def get_cord_ids():
    return jsonify(get_cord_id_list())

app.run(host='127.0.0.1', port=5000, debug=True)

