from flask import Blueprint, request, jsonify

url_bp = Blueprint('url', __name__)

@url_bp.route('/url', methods=['POST'])
def process_url():
    return jsonify({'message': 'URL endpoint working!'})