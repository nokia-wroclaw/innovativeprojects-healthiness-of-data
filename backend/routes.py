from flasgger import Swagger, swag_from
from flask import Flask, request, jsonify
from flask_cors import CORS

from backend.api_functions.aggregates import calculate_operator_aggregates, calculate_cluster_aggregates
from backend.api_functions.cluster_comparison import *
from backend.api_functions.coverage import calculate_cluster_coverage
from backend.api_functions.decomposition import calculate_cluster_decomposition
from backend.api_functions.map2d_multi_cord import *
from backend.api_functions.outliers import find_outliers
from backend.api_functions.utils import get_cord_id_list, get_cord_acronym_set, get_acronym_list, get_kpi_list

app = Flask(__name__)
CORS(app)
Swagger(app)


# @swag_from('api_docs/comparison_clusters.yml', validation=True)
@app.route('/api/clusters/map2D_v2/<string:kpi_basename>', methods=['GET'])
def get_map2D_v2(kpi_basename):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')

    cord_list = ['Mr. Mime', 'Lapras', 'Dragalge', 'Naganadel', 'Pelipper', 'Piplup', 'Rotom',  'Vigoroth', 'Timburr', 'Raticate']

    data, status_code = get_map(date_start, date_end, kpi_basename, cord_list)
    return jsonify(data), status_code


# @swag_from('api_docs/comparison_clusters.yml', validation=True)
@app.route('/api/clusters/map2D/<string:cord_id1>/<string:cord_id2>/<string:kpi_basename>', methods=['GET'])
def get_map2D(cord_id1, cord_id2, kpi_basename):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')

    data, status_code = cluster_comparison(date_start, date_end, cord_id1, cord_id2, kpi_basename)
    return jsonify(data), status_code


@swag_from('api_docs/aggregates_operators.yml', validation=True)
@app.route('/api/operators/aggregates/<string:cord_id>', methods=['GET'])
def get_operator_aggregates(cord_id):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    histogram_bins = request.args.get('bins')  # DEFAULT 10

    data, status_code = calculate_operator_aggregates(date_start, date_end, kpi_basename, cord_id,
                                                      hist_bins=histogram_bins)
    return jsonify(data), status_code


@swag_from('api_docs/aggregates_clusters.yml', validation=True)
@app.route('/api/clusters/aggregates/<string:cord_id>/<string:acronym>', methods=['GET'])
def get_cluster_aggregates(cord_id, acronym):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    histogram_bins = request.args.get('bins')

    data, status_code = calculate_cluster_aggregates(date_start, date_end, kpi_basename, cord_id, acronym,
                                                     hist_bins=histogram_bins)
    return jsonify(data), status_code


@swag_from('api_docs/coverage_clusters.yml', validation=True)
@app.route('/api/coverage/<string:cord_id>', methods=['GET'])
def get_operator_coverages(cord_id):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpis = request.args.getlist('kpi_basename')
    acronyms = request.args.getlist('acronym')
    gap_size = request.args.get('gap_size')

    data, status_code = calculate_cluster_coverage(date_start, date_end, cord_id, acronyms, kpis, gap_size)
    return jsonify(data), status_code


@swag_from('api_docs/outliers_clusters.yml', validation=True)
@app.route('/api/outliers/<string:cord_id>/<string:acronym>', methods=['GET'])
def get_operator_outliers(cord_id, acronym):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    threshold = request.args.get('threshold')
    window_size = request.args.get('window_size')

    data, status_code = find_outliers(date_start, date_end, kpi_basename, cord_id, acronym, threshold=threshold,
                                      window_size=window_size)
    return jsonify(data), status_code


@swag_from('api_docs/decomposition_clusters.yml', validation=True)
@app.route('/api/decomposition/<string:cord_id>/<string:acronym>', methods=['GET'])
def get_cluster_decomposition(cord_id, acronym):
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    kpi_basename = request.args.get('kpi_basename')
    frequency = request.args.get('frequency')

    data, status_code = calculate_cluster_decomposition(date_start, date_end, kpi_basename, cord_id, acronym, frequency)
    return jsonify(data), status_code


@swag_from('api_docs/fetch_kpi_basename.yml')
@app.route('/api/fetch_kpi_basenames', methods=['GET'])
def get_kpi_basenames():
    return jsonify(get_kpi_list())


@swag_from('api_docs/fetch_acronyms.yml')
@app.route('/api/fetch_acronyms', methods=['GET'])
def get_acronyms():
    return jsonify(get_acronym_list())


@swag_from('api_docs/fetch_cord_acronym_set.yml')
@app.route('/api/fetch_cord_acronym_set', methods=['GET'])
def get_cord_acronyms_set():
    return jsonify(get_cord_acronym_set())


@swag_from('api_docs/fetch_cord_ids.yml')
@app.route('/api/fetch_cord_ids', methods=['GET'])
def get_cord_ids():
    return jsonify(get_cord_id_list())


def starter():
    with open("config.yml", 'r') as yml_file:
        config = yaml.load(yml_file)['flask_options']
    app.run(host=config['host_address'], port=config['host_port'], debug=config['debug_mode'])
