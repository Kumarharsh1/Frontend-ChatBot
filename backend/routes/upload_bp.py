import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from services.upload_service import UploadService

upload_bp = Blueprint('upload', __name__)
upload_service = UploadService()

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/file', methods=['POST'])
def upload_file():
    print("Upload route hit!")  # debug
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        filepath = os.path.join(upload_folder, filename)
        try:
            file.save(filepath)
        except Exception as e:
            return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

        try:
            result = upload_service.process_file(filepath, request.form.get('type', 'general'))
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': f'File processing error: {str(e)}'}), 500

    return jsonify({'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
