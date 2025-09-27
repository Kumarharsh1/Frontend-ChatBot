from flask import Blueprint, request, jsonify

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/file', methods=['POST'])
def upload_file():
    return jsonify({'message': 'Upload endpoint working!'})